import * as model from "./model";
import * as event from "./event";

export class Quest {
    id: model.QuestId;
    events: Map<model.QuestStage, event.Event[]>;
    start: model.QuestStage;
    complete: model.QuestStage;
}
