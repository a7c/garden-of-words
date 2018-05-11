import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import events from "./data/events";
import * as locations from "./data/locations";
import * as actions from "./actions/actions";

import * as lookup from "./model/lookup";

export default function wander(store: model.Store): model.LearnableId | event.Event | null {
    const { location, learned } = store;

    // Turn location-name into locationName
    const locationKey = location.current.replace(/-[a-z]/g, (a) => a.slice(1).toUpperCase());
    const locationData = locations.getLocation(location.current);

    const eventList = events[locationKey];

    for (const ev of eventList) {
        if (!ev.check(store)) {
            continue;
        }

        return ev;
    }

    const learnable = lookup.getNextLearnable(store);
    if (learnable !== null) {
        if (locationData.wanderEvents) {
            return locationData.wanderEvents.getRandomEvent(store);
        }
        return new event.FlavorEvent(
            [],
            [],
            "You wander aimlessly."
        );
    }
    return null;
}
