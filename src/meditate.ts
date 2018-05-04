import * as immutable from "immutable";

import * as model from "./model/model";
import * as question from "./model/question";
import * as lookup from "./model/lookup";
import * as event from "./model/event";

import * as resources from "./model/resources";

export default function meditate(
    store: model.Store
): event.QuestionEvent | null {
    const learned = store.learned;
    const leastRecentlyReviewed = lookup.getLeastRecentlyReviewed(learned);
    if (leastRecentlyReviewed !== null) {
        let q = lookup.generateQuestion(leastRecentlyReviewed);

        // Only generate multiple-choice questions for low score
        // learnables
        if (store.learned.get(leastRecentlyReviewed.id)!.score < 20) {
            q = lookup.generateMultipleChoice(leastRecentlyReviewed);
        }

        const questionEvent = new event.QuestionEvent(
            [], // filters
            [new event.ResourceEffect(resources.STAMINA, -resources.getMeditateStaminaCost(store))], // effects
            q, // question template
            null, // flavor
            null, // postFlavor
            "You feel refreshed after meditating.", // correctPostFlavor
            "You tried to meditate but got distracted.", // wrongPostFlavor
            [] // failureEffects
        );
        questionEvent.allowNavigation = true;

        return questionEvent;
    }

    return null;
}
