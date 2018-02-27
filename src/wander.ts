import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";
import events from "./data/events";

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
