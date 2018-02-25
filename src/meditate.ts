import * as immutable from "immutable";

import * as model from "./model/model";
import * as question from "./model/question";

import { hiraganaBasicDict } from "./model/kana";

export default function meditate(
    learned: immutable.Map<model.LearnableId, model.Learned>
): question.Question | null {
    let leastRecentlyReviewed: model.LearnableId | null = null;
    let lastDate: Date | null = null;

    learned.forEach((v, k) => {
        if (!v || !k) {
            return;
        }

        if (lastDate == null || v.get("lastReviewed") < lastDate) {
            leastRecentlyReviewed = k;
            lastDate = v.get("lastReviewed");
        }
    });

    if (leastRecentlyReviewed !== null) {
        // TODO: works for hiragana and katakana, but need to decide how to handle general vocab words
        let reviewedWord: model.Learnable = learned.get(leastRecentlyReviewed).get("item")!;
        // build a list of 3 wrong answers and the right answer
        let options: model.Learnable[] = [];
        let keyList = hiraganaBasicDict.keySeq().toArray();
        keyList.splice(keyList.indexOf(reviewedWord.id), 1);

        for (let i = 0; i < 3; i++) {
            let index = Math.floor(Math.random() * keyList.length);
            options.push(hiraganaBasicDict.get(keyList[index]));
            keyList.splice(index, 1);
        }

        // insert correct answer in a random place
        let correctIdx = Math.floor(Math.random() * (options.length + 1));
        options.splice(correctIdx, 0, reviewedWord);

        return new question.MultipleChoice([reviewedWord.id], options, correctIdx, correctIdx);
    }

    return null;
}
