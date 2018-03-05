import * as model from "./model";

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

// TODO: hacky? used when we already have a multiple choice question generated but
// we still want to make a QuestionEvent
export class MultipleChoiceWrapperQuestionTemplate {
    question: Question;

    constructor(question: Question) {
        this.question = question;
    }

    makeQuestion(store: model.Store): Question {
        return this.question;
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
            items.map(id => store.learned.get(id).item),
            correct,
            correct
        );
    }
}
