import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";
import { katakanaBasicDict } from "./model/kana";
import events from "./data/events";
import * as actions from "./actions/actions";

import * as lookup from "./model/lookup";

export default function wander(store: model.Store):
model.Learnable | event.Event | null {
    const { location, learned } = store;
    // TODO: full location-based event system
    if (location === "vending-machine") {
        for (const ev of events.vendingMachine) {
            if (!ev.check(store)) {
                continue;
            }

            return ev;
        }
    }

    for (let i = 0; i < events.events.length; i++) {
        const ev = events.events[i];
        if (!ev.check(store)) {
            continue;
        }

        return events.events.splice(i, 1)[0];
    }

    // let word: model.Learnable | null = null;
    // return word;

    return lookup.getNextLearnable(store);
}
