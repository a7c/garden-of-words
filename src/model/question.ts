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
    reverse: boolean;

    constructor(teaches: model.LearnableId[],
                choices: model.Learnable[], questionIdx: number, answerIdx: number,
                reverse: boolean) {
        super(teaches);
        this.choices = choices;
        this.questionIdx = questionIdx;
        this.answerIdx = answerIdx;
        this.reverse = reverse;
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
    reverse: boolean;

    constructor(collection: model.CollectionId, onlySeen: boolean, reverse: boolean) {
        this.collection = collection;
        this.onlySeen = onlySeen;
        this.reverse = reverse;
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
            correct,
            this.reverse), [], []];
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

        const learnables = lookup.getCollections()[this.collection]
            .learnables
            .filter((id: string) => {
                const learnable = lookup.getLearnable(id);
                return id.includes("kana-romaji") &&
                    // Don't choose a word that's already been learned
                    !learned.has(id) &&
                    // Don't choose a word they can't type
                    learnable.back.match(/^[a-zA-Z]+$/) &&
                    // If onlySeenKana is true, make sure they know at least one of the kana
                    (!this.onlySeenKana || Array.from(learnable.front).some(k => learned.has(`hira-${k}`)));
            })
            .sort((a, b) => {
                // Sort by # of known kana in word
                const learnable1 = lookup.getLearnable(a);
                const learnable2 = lookup.getLearnable(b);

                const knownKana1 = Array.from(learnable1.front).filter(k => learned.has(`hira-${k}`)).length;
                const knownKana2 = Array.from(learnable2.front).filter(k => learned.has(`hira-${k}`)).length;

                return knownKana2 - knownKana1;
            });
        for (const wordId of learnables) {
            const learnable = lookup.getLearnable(wordId);

            // If desired, don't choose a word that the player hasn't learned the kana for
            const kanaReading = learnable.front;

            const effects = [
                new event.LearnEffect(wordId, ""),
                new event.LearnEffect(wordId + "-reverse", "")
            ];

            if (learnable.parentId) {
                effects.push(new event.LearnEffect(learnable.parentId));
            }

            // TODO: what if this.onlySeenKana is false
            for (const k of kanaReading) {
                effects.push(new event.ReviewCorrectEffect(`hira-${k}`));
            }

            return [
                lookup.generateTypeIn(learnable),
                effects,
                [] as event.Effect[],
            ];
        }

        // If no suitable words are found, default to generating a review
        const leastRecentlyReviewed = lookup.getLeastRecentlyReviewed(
            learned,
            (learnable) => !!learnable.back.match(/^[a-zA-Z]+$/)
        );
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
