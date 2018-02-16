import * as model from "./model";
import * as event from "./event";

export class Quest {
    id: model.QuestId;
    events: Map<model.QuestStage, event.Event[]>;
    complete: model.QuestStage;

    constructor(id: model.QuestId, events: Map<model.QuestStage, event.Event[]>,
                complete: model.QuestStage) {
        this.id = id;
        this.events = events;
        this.complete = complete;
    }
}
