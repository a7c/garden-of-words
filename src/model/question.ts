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
    sequence: boolean;

    constructor(teaches: model.LearnableId[],
                choices: model.Learnable[], questionIdx: number, answerIdx: number,
                reverse: boolean = false, sequence: boolean = false) {
        super(teaches);
        this.choices = choices;
        this.questionIdx = questionIdx;
        this.answerIdx = answerIdx;
        this.reverse = reverse;
        this.sequence = sequence;

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
    /** What types of learnables to choose from within the collection(s) */
    restrictLearnableTypes: string[];
    onlySeen: boolean;
    reverse: boolean;

    constructor(collection: model.CollectionId, restrictLearnableTypes: string[],
                onlySeen: boolean, reverse: boolean = false) {
        this.collection = collection;
        this.restrictLearnableTypes = restrictLearnableTypes;
        this.onlySeen = onlySeen;
        this.reverse = reverse;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const candidates = lookup.getCollections()[this.collection]
            .learnables
            .filter(id => {
                if (this.onlySeen && !store.learned.has(id)) {
                    return false;
                }

                const learnable = lookup.getLearnable(id);
                if (store.learned.has(id)) {
                    if (this.restrictLearnableTypes.length === 0) {
                        return true;
                    }
                    else {
                        for (const substr of this.restrictLearnableTypes) {
                            if (learnable.type.includes(substr)) {
                                return (
                                    substr.includes("reverse") ||
                                    // if "reverse" not specified, don't let learnable types with "reverse"
                                    // in them count
                                    !learnable.type.includes("reverse")
                                );
                            }
                        }
                        return false;
                    }
                }
                return false;
            });

        const correct = Math.floor(Math.random() * candidates.length);
        return [new MultipleChoice(
            [ candidates[correct] ],
            candidates.map(id => lookup.getLearnable(id)),
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
    collections: model.CollectionId[];
    /** Whether to only display words for which the kana has already been learned */
    onlySeenKana: boolean;

    constructor(collections: model.CollectionId[], onlySeenKana: boolean) {
        this.collections = collections;
        this.onlySeenKana = onlySeenKana;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const { learned, collections } = store;

        const learnables =
            this.collections.map((collectionId) => {
                return lookup.getCollections()[collectionId]
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
                    });
            }).reduce((acc, val) => acc.concat(val), [] // flatten
            ).sort((a, b) => {
                // Sort by # of unknown kana in word
                const learnable1 = lookup.getLearnable(a);
                const learnable2 = lookup.getLearnable(b);

                const knownKana1 = Array.from(learnable1.front).filter(k => !learned.has(`hira-${k}`)).length;
                const knownKana2 = Array.from(learnable2.front).filter(k => !learned.has(`hira-${k}`)).length;

                return knownKana1 - knownKana2;
            });
        for (const wordId of learnables) {
            const learnable = lookup.getLearnable(wordId);
            console.log(Array.from(learnable.front).filter(k => learned.has(`hira-${k}`)).length);

            // If desired, don't choose a word that the player hasn't learned the kana for
            const kanaReading = learnable.front;

            const effects = [
                new event.LearnEffect(wordId, ""),
                new event.LearnEffect(wordId + "-reverse", "")
            ];

            if (learnable.parentId) {
                effects.push(new event.LearnEffect(learnable.parentId + "-kana-meaning"));
                effects.push(new event.LearnEffect(learnable.parentId + "-kana-meaning-reverse", ""));
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
