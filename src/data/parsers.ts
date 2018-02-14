import * as event from "../model/event";
import * as quest from "../model/quest";

type ActionProps =
    { type: "flag", flag: string, value: boolean } |
    { type: "resource", resource: string, value: number };

export function parseAction(json: ActionProps): event.Action | null {
    if (json.type === "flag") {
        return new event.FlagAction(json.flag, json.value);
    }
    else if (json.type === "resource") {
        return new event.ResourceAction(json.resource, json.value);
    }
    return null;
}

export function parseFilter(): event.Filter | null {
    return null;
}

export function parseQuest(): quest.Quest | null {
    return null;
}
