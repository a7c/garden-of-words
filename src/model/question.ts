import * as model from "./model";
import * as lookup from "./lookup";
import { vocabDict } from "./vocab";

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
    makeQuestion(store: model.Store): Question {
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

    makeQuestion(store: model.Store): Question {
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
        return new MultipleChoice(
            [ items[correct] ],
            items.map(id => lookup.getLearnable(id)),
            correct,
            correct
        );
    }
}

// TODO: WIP
// export class TypeInQuestionTemplate  {
//     /** Whether to only display words for which the kana has already been learned */
//     onlySeenKana: boolean;

//     constructor(onlySeenKana: boolean) {
//         this.onlySeenKana = onlySeenKana;
//     }

//     makeQuestion(store: model.Store): Question {
//         //
//         return null;
//     }
// }
