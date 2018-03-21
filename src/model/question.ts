import * as model from "./model";
import * as event from "./event";
import * as lookup from "./lookup";

export class Question {
    teaches: model.LearnableId[];

    constructor(teaches: model.LearnableId[]) {
        this.teaches = teaches;
    }
}

export class MultipleChoice extends Question {
    choices: model.Learnable[];
    questionIdx: number;
    answerIdx: number;

    constructor(teaches: model.LearnableId[],
                choices: model.Learnable[], questionIdx: number, answerIdx: number) {
        super(teaches);
        this.choices = choices;
        this.questionIdx = questionIdx;
        this.answerIdx = answerIdx;
    }

    get question() {
        return this.choices[this.questionIdx];
    }

    get answer() {
        return this.choices[this.answerIdx];
    }

    correct(idx: number) {
        return idx === this.answerIdx;
    }
}

export class TypeIn extends Question {
    learnable: model.Learnable;

    constructor(teaches: model.LearnableId[], learnable: model.Learnable) {
        super(teaches);
        this.learnable = learnable;
    }

    correct(input: string) {
        console.log(this.learnable, input);
        return input.trim() === this.learnable.back;
    }
}

export class MadLib extends Question {
    sentence: model.Learnable[];
    choices: model.Learnable[];
    blanks: number[];

    constructor(teaches: model.LearnableId[],
                sentence: model.Learnable[], choices: model.Learnable[], blanks: number[]) {
        super(teaches);
        this.sentence = sentence;
        this.choices = choices;
        this.blanks = blanks;
    }
}

export abstract class QuestionTemplate {
    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        throw "@QuestionTemplate#makeQuestion: virtual method not implemented";
    }
}

export class MultipleChoiceQuestionTemplate {
    collection: model.CollectionId;
    onlySeen: boolean;

    constructor(collection: model.CollectionId, onlySeen: boolean) {
        this.collection = collection;
        this.onlySeen = onlySeen;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const choices = store.collections.get(this.collection).toArray();
        // TODO: support onlySeen = false
        if (choices.length < 4) {
            throw "@MultipleChoiceQuestionTemplate#makeQuestion: not enough choices";
        }

        const items = [];
        for (let i = 0; i < 4; i++) {
            const idx = Math.floor(Math.random() * choices.length);
            items.push(choices.splice(idx, 1)[0]);
        }

        const correct = Math.floor(Math.random() * items.length);
        return [new MultipleChoice(
            [ items[correct] ],
            items.map(id => lookup.getLearnable(id)),
            correct,
            correct
        ), [], []];
    }
}

/**
 *  A template for that produces kana -> romaji type-in questions that teach you a new
 *  vocab word afterward.
 */
export class TypeInLearnVocabTemplate {
    collection: model.CollectionId;
    /** Whether to only display words for which the kana has already been learned */
    onlySeenKana: boolean;

    constructor(collection: model.CollectionId, onlySeenKana: boolean) {
        this.collection = collection;
        this.onlySeenKana = onlySeenKana;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const { learned, collections } = store;

        const learnables = lookup.getCollections()[this.collection].learnables.filter(
            (id: string) => id.includes("kana-romaji")
        );
        for (const wordId of learnables) {
            // Don't choose a word that's already been learned
            if (learned.has(wordId)) {
                continue;
            }

            const learnable = lookup.getLearnable(wordId);

            // Don't choose a word they can't type
            if (!learnable.back.match(/^[a-zA-Z]+$/)) {
                continue;
            }

            // If desired, don't choose a word that the player hasn't learned the kana for
            if (this.onlySeenKana) {
                const kanaReading = learnable.front;
                for (const k of kanaReading) {
                    if (!learned.has(`hira-${k}`) && !learned.has(`kata-${k}`)) {
                        continue;
                    }
                }
            }
            return [
                lookup.generateTypeIn(lookup.getLearnable(wordId)),
                [
                    new event.LearnEffect(wordId),
                    new event.LearnEffect(wordId + "-reverse"),
                ],
                [] as event.Effect[],
            ];
        }

        // If no suitable words are found, default to generating a review
        const leastRecentlyReviewed = lookup.getLeastRecentlyReviewed(learned);
        if (leastRecentlyReviewed !== null) {
            return [
                lookup.generateTypeIn(leastRecentlyReviewed),
                [] as event.Effect[],
                [] as event.Effect[],
            ];
        }
        // If you can't even do that, then you shouldn't really have done this in the first place
        throw "Tried to make question with TypeInLearnVocabTemplate but the player hasn't even learned anything yet!";
    }
}
