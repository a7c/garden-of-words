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
