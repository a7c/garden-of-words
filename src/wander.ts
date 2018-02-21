import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";
import events from "./data/events";

export default function wander(
    location: model.Location,
    resources: immutable.Map<model.Resource, number>,
    learned: immutable.Map<model.LearnableId, model.Learned>
): model.Learnable | event.Event | null {
    // TODO: full location-based event system
    if (location === "vending-machine") {
        for (const ev of events.vendingMachine) {
            for (const filter of ev.filters) {
            }
            return ev;
        }
    }

    if (events.events.length > 0) {
        return events.events.shift();
    }

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
