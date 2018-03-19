import * as model from "./model";
import * as event from "./event";

export class Quest {
    id: model.QuestId;
    name: string;
    events: Map<model.QuestStage, event.Event[]>;
    complete: model.QuestStage;
    journal: Map<model.QuestStage, string>;

    constructor(id: model.QuestId,
                name: string,
                events: Map<model.QuestStage, event.Event[]>,
                journal: Map<model.QuestStage, string>,
                complete: model.QuestStage) {
        this.id = id;
        this.name = name;
        this.events = events;
        this.journal = journal;
        this.complete = complete;
    }
}
