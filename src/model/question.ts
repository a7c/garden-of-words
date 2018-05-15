import * as wanakana from "wanakana";

import * as model from "./model";
import * as event from "./event";
import * as lookup from "./lookup";
import * as npc from "./npc";

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * Source: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
function shuffle(a: any) { //tslint:disable-line
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

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

    prompt() {
        return {
            "hiragana": "Choose the pronunciation for",
            "katakana": "Choose the pronunciation for",
            "vocab-kana-romaji": "Choose the reading for",
        }[this.choices[this.answerIdx].type] || "Find the matching choice";
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
        let candidates = lookup.getCollections()[this.collection]
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

        // cap question length at 4.
        // TODO: Could be more robust but currently this is all we use.
        candidates = shuffle(candidates);
        if (candidates.length > 4) {
            candidates = candidates.slice(0, 4);
        }

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
 *  A template for making questions with the following properties:
 *    (1) Prompt: romaji version of a Japanese name
 *    (2) Answers: 4 kana names with these properties:
 *        (a) same length (in kana)
 *        (b) contains at most 1 kana the player doesn't know
 *        (c) names can be disambiguated using only the kana that the player already knows
 *    (3) Effects: review kana, learn any previously unknown kana in the correct answer.
 *
 *  Precondition: The player should have already learned enough kana to generate a valid question
 *    of this type.
 */
// TODO: property 2c is not yet enforced
export class MultipleChoiceNameQuestionTemplate extends QuestionTemplate {

    reverse: boolean;

    constructor(reverse: boolean = false) {
        super();
        this.reverse = reverse;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const { learned } = store;

        const names =
            // Get all the available names
            lookup.getNames(npc.Gender.Male)
            .concat(lookup.getNames(npc.Gender.Female))
            // Keep only the names that have 1 or fewer unknown kana
            .filter((name: npc.Name) => {
                return Array.from(name).filter(k => !learned.has(`hira-${k}`)).length <= 1;
            });

        // TODO: make this not hard-coded
        const nameLengths = [5, 4, /*2,*/ 3];
        let candidates: npc.Name[] = [];
        for (const nameLength of nameLengths) {
            candidates = names.filter((name: npc.Name) => name.length === nameLength);
            if (candidates.length < 4) {
                continue;
            }
            else {
                // TODO: need to check whether candidates can be disambiguated based only on learned kana
                break;
            }
        }
        if (candidates.length < 4) {
            throw "Tried to make question with MultipleChoiceNameQuestionTemplate " +
                " but the player hasn't learned enough kana!";
        }

        shuffle(candidates);
        candidates = candidates.slice(0, 4);

        const correct = Math.floor(Math.random() * candidates.length);

        const teaches = [];
        // Keep track of kana we've already processed
        const seen = {};
        for (const k of candidates[correct]) {
            if (seen[k] === undefined) {
                seen[k] = "";
                teaches.push(`hira-${k}`);
            }
        }

        // TODO: make the learnable somewhere else? does it need to be a learnable?
        const nameLearnables = candidates.map(name => {
            const nameInRomaji: string = wanakana.toRomaji(name);
            return {
                type: "name-kana-romaji",
                id: `name-${name}`,
                parentId: null,
                collection: "",
                front: nameInRomaji.charAt(0).toUpperCase() + nameInRomaji.substr(1),
                back: name,
            };
        });

        return [new MultipleChoice(
            teaches,
            nameLearnables,
            correct,
            correct,
            this.reverse), [], []];
    }
}

/**
 *  A template that produces kana -> romaji type-in questions based on what needs to be reviewed next/soon.
 */
export class TypeInReviewTemplate {
    collections: model.CollectionId[];

    constructor(collections: model.CollectionId[]) {
        this.collections = collections;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const { learned, collections } = store;

        const learnable = lookup.getLeastRecentlyReviewed(
            learned,
            l => this.collections.indexOf(l.collection) > -1
                && !!l.back.match(/^[a-zA-Z]+$/)
        );
        if (learnable !== null) {
            return [
                lookup.generateTypeIn(learnable),
                [] as event.Effect[],
                [] as event.Effect[],
            ];
        } else {
            throw "Tried to make question with TypeInReviewTemplate " +
                "but the player hasn't even learned anything yet!";
        }
    }
}

/**
 *  A template that produces kana -> romaji type-in questions that use only the vocab
 *  words the player already knows.
 */
export class TypeInVocabTemplate {
    collections: model.CollectionId[];

    constructor(collections: model.CollectionId[]) {
        this.collections = collections;
    }

    makeQuestion(store: model.Store): [Question, event.Effect[], event.Effect[]] {
        const { learned, collections } = store;

        const learnable = lookup.getLeastRecentlyReviewed(
            learned,
            l => this.collections.indexOf(l.collection) > -1
                && l.id.includes("kana-romaji")
                && !!l.back.match(/^[a-zA-Z]+$/)
        );

        if (learnable === null) {
            throw "Tried to make question with TypeInVocabTemplate but the player hasn't even learned anything yet!";
        }

        const effects = [];

        const kanaReading = learnable.front;
        for (const k of kanaReading) {
            effects.push(new event.ReviewCorrectEffect(`hira-${k}`));
        }

        return [
            lookup.generateTypeIn(learnable),
            effects,
            [] as event.Effect[],
        ];
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

                const unknownKana1 = Array.from(learnable1.front).filter(k => !learned.has(`hira-${k}`)).length;
                const unknownKana2 = Array.from(learnable2.front).filter(k => !learned.has(`hira-${k}`)).length;

                return unknownKana1 - unknownKana2;
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
                if (learned.has(`hira-${k}`)) {
                    effects.push(new event.ReviewCorrectEffect(`hira-${k}`));
                }
                // If we've never seen the kana but you got it right, then learn the kana
                else {
                    effects.push(new event.LearnEffect(`hira-${k}`));
                }
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
