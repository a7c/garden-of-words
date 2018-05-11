import * as model from "./model";
import * as event from "./event";

export type ChecklistEntry = { description: string, hiddenDescription?: string, filter: event.Filter };
export type Checklist = ChecklistEntry[];

export class Quest {
    id: model.QuestId;
    name: string;
    events: Map<model.QuestStage, event.Event[]>;
    complete: model.QuestStage;
    journal: Map<model.QuestStage, string>;
    checklists: Map<model.QuestStage, Checklist>;

    constructor(id: model.QuestId,
                name: string,
                events: Map<model.QuestStage, event.Event[]>,
                journal: Map<model.QuestStage, string>,
                checklists: Map<model.QuestStage, Checklist>,
                complete: model.QuestStage) {
        this.id = id;
        this.name = name;
        this.events = events;
        this.journal = journal;
        this.complete = complete;
        this.checklists = checklists;
    }
}
