import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";

export default function wander(
    learned: immutable.Map<model.LearnableId, model.Learned>
): model.Learnable | event.Event | null {
    let word: model.Learnable | null = null;

    hiraganaBasicDict.keySeq().some((key: string | undefined) => {
        if (key !== undefined && !learned.has(key)) {
            word = hiraganaBasicDict.get(key);
            return true;
        }
        else {
            return false;
        }
    });

    return word;
}
