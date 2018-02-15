import * as event from "../model/event";
import * as quest from "../model/quest";

type ActionProps =
    { type: "quest", quest: string, stage: string, journal?: string } |
    { type: "flag", flag: string, value: boolean } |
    { type: "resource", resource: string, value: number };

type FilterProps = {};

type EventProps = { type: "flavor", text: string, actions: ActionProps[], filters: FilterProps };

export function parseAction(json: ActionProps): event.Action | null {
    if (json.type === "flag") {
        return new event.FlagAction(json.flag, json.value);
    }
    else if (json.type === "resource") {
        return new event.ResourceAction(json.resource, json.value);
    }
    else if (json.type === "quest") {
        return new event.QuestAction(json.quest, json.stage, json.journal);
    }
    return null;
}

export function parseFilter(): event.Filter | null {
    return null;
}

export function parseEvent(): event.Event | null {
    return null;
}

export function parseQuest(): quest.Quest | null {
    return null;
}
