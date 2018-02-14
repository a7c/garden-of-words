import * as model from "./model";

export class Question {

}

export class MultipleChoice extends Question {
    choices: model.Learnable[];
    answerIdx: number;

    constructor(choices: model.Learnable[], answerIdx: number) {
        super();
        this.choices = choices;
        this.answerIdx = answerIdx;
    }
}

export class MadLib extends Question {
    sentence: model.Learnable[];
    choices: model.Learnable[];
    blanks: number[];

    constructor(sentence: model.Learnable[], choices: model.Learnable[], blanks: number[]) {
        super();
        this.sentence = sentence;
        this.choices = choices;
        this.blanks = blanks;
    }
}
