import * as event from "../model/event";
import * as model from "../model/model";
import * as quest from "../model/quest";

export class ParseError {
    message: string;
    object: Object;

    constructor(message: string, object: Object) {
        this.message = message;
        this.object = object;
    }
}

type EffectProps =
    { type: "quest", quest: model.QuestId, stage: model.QuestStage, journal?: string } |
    { type: "flag", flag: string, value: boolean } |
    { type: "resource", resource: string, value: number };

type FilterProps =
    { type: "location", location: model.Location } |
    { type: "flag", flag: string, value: boolean } |
    { type: "quest", quest: model.QuestId, stage: model.QuestStage };

type EventProps = { type: "flavor", text: string, effects: EffectProps[], filters: FilterProps[] };

type QuestProps = { id: model.QuestId, complete: model.QuestStage, events: {
    [ stage: string ]: EventProps[],
} };

export function parseEffect(json: EffectProps): event.Effect {
    if (json.type === "flag") {
        return new event.FlagEffect(json.flag, json.value);
    }
    else if (json.type === "resource") {
        return new event.ResourceEffect(json.resource, json.value);
    }
    else if (json.type === "quest") {
        return new event.QuestEffect(json.quest, json.stage, json.journal);
    }
    throw new ParseError("Unrecognized effect", json);
}

export function parseFilter(json: FilterProps): event.Filter {
    if (json.type === "flag") {
        return new event.FlagFilter(json.flag, json.value);
    }
    else if (json.type === "location") {
        return new event.LocationFilter(json.location);
    }
    else if (json.type === "quest") {
        return new event.QuestFilter(json.quest, json.stage);
    }

    throw new ParseError("Unrecognized filter", json);
}

export function parseEvent(json: EventProps): event.Event {
    if (json.type === "flavor") {
        return new event.FlavorEvent(
            json.filters.map(parseFilter),
            json.effects.map(parseEffect),
            json.text
        );
    }
    throw new ParseError("Unrecognized event", json);
}

export function parseQuest(json: QuestProps): quest.Quest {
    const events = new Map();
    for (const stage of Object.keys(json.events)) {
        events.set(stage, json.events[stage].map(parseEvent));
    }
    return new quest.Quest(json.id, events, json.complete);
}
