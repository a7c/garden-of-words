import * as immutable from "immutable";

import * as model from "./model/model";
import * as question from "./model/question";
import * as lookup from "./model/lookup";
import * as event from "./model/event";

import * as resources from "./data/constants/resources";

export default function meditate(
    learned: immutable.Map<model.LearnableId, model.Learned>
): event.QuestionEvent | null {
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
        const reviewedWord: model.LearnableId = learned.get(leastRecentlyReviewed).get("item")!;
        const q = lookup.generateMultipleChoice(reviewedWord);
        // console.log(vocabDict);
        // TODO: integrate into lookup
        // const q = new question.TypeIn(["vocab-青い"], vocabDict.get("vocab-青い").toKanaRomajiLearnable());

        const questionEvent = new event.QuestionEvent(
            [], // filters
            [new event.ResourceEffect(resources.STAMINA, -resources.MEDITATE_STA_COST)], // effects
            q, // question template
            null, // flavor
            null, // postFlavor
            "You feel refreshed after meditating.", // correctPostFlavor
            "You tried to meditate but got distracted.", // wrongPostFlavor
            [] // failureEffects
        );

        return questionEvent;
    }

    return null;
}
