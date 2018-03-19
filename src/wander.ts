import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";
import { katakanaBasicDict } from "./model/kana";
import events from "./data/events";
import * as actions from "./actions/actions";

import * as lookup from "./model/lookup";

export default function wander(store: model.Store): model.LearnableId | event.Event | null {
    const { location, learned } = store;

    // Turn location-name into locationName
    const locationKey = location.current.replace(/-[a-z]/g, (a) => a.slice(1).toUpperCase());

    const eventList = events[locationKey];

    for (const ev of eventList) {
        if (!ev.check(store)) {
            continue;
        }

        return ev;
    }

    // return events.airportGate.splice(i, 1)[0];

    return lookup.getNextLearnable(store);
}
