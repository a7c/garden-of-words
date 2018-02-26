import * as model from "./model";
import { katakanaBasicDict, hiraganaBasicDict } from "./kana";
import * as actions from "../actions/actions";

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