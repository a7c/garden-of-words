import * as immutable from "immutable";

import * as model from "./model/model";
import * as question from "./model/question";

import * as lookup from "./model/lookup";

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
        return lookup.generateMultipleChoice(reviewedWord);
    }

    return null;
}
