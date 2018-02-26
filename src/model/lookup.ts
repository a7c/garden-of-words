import * as model from "./model";
import { katakanaBasicDict, hiraganaBasicDict } from "./kana";
import * as actions from "../actions/actions";
import * as question from "./question";

export function getNextLearnable(store: model.Store): model.Learnable | null {
    const{ learned, flags } = store;

    let word: model.Learnable | null = null;

    if (!flags.get("hiragana-complete")) {
        let hiraNotComplete = hiraganaBasicDict.keySeq().some((key: string | undefined) => {
            if (key !== undefined && !learned.has(key)) {
                word = hiraganaBasicDict.get(key);
                return true;
            }
            else {
                return false;
            }
        });
        if (!hiraNotComplete) {
            actions.updateFlag("hiragana-complete", true);
        }
    }
    else if (!flags.get("katakana-complete")) {
        let kataNotComplete = katakanaBasicDict.keySeq().some((key: string | undefined) => {
            if (key !== undefined && !learned.has(key)) {
                word = katakanaBasicDict.get(key);
                return true;
            }
            else {
                return false;
            }
        });
        if (!kataNotComplete) {
            actions.updateFlag("katakana-complete", true);
        }
    }
    // TODO: Decision making for actual vocab words

    return word;
}

export function generateMultipleChoice(word: model.Learnable) {
    // build a list of 3 wrong answers and the right answer
    let options: model.Learnable[] = [];
    let keyList = hiraganaBasicDict.keySeq().toArray();
    keyList.splice(keyList.indexOf(word.id), 1);

    for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * keyList.length);
        options.push(hiraganaBasicDict.get(keyList[index]));
        keyList.splice(index, 1);
    }

    // insert correct answer in a random place
    let correctIdx = Math.floor(Math.random() * (options.length + 1));
    options.splice(correctIdx, 0, word);

    return new question.MultipleChoice([word.id], options, correctIdx, correctIdx);
}

export function getLearnable(id: model.LearnableId): model.Learnable {
    if (hiraganaBasicDict.get(id)) {
        return hiraganaBasicDict.get(id);
    }
    else {
        return katakanaBasicDict.get(id);
    }
    // TODO: logic for general vocab words
}

// TODO: Necessary?
// export function getLearnableId(learnable: model.Learnable): model.LearnableId{

// }