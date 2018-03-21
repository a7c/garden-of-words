import * as immutable from "immutable";

import * as model from "./model/model";
import * as question from "./model/question";
import * as lookup from "./model/lookup";
import * as event from "./model/event";

import * as resources from "./data/constants/resources";

export default function meditate(
    learned: immutable.Map<model.LearnableId, model.Learned>
): event.QuestionEvent | null {
    const leastRecentlyReviewed = lookup.getLeastRecentlyReviewed(learned);
    if (leastRecentlyReviewed !== null) {
        const q = lookup.generateQuestion(leastRecentlyReviewed);

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
