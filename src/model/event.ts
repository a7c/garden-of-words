import * as model from "./model";
import * as question from "./question";
import * as actions from "../actions/actions";

export class Action {
    // TODO: this signature needs to be more precise
    apply(store: model.Store) {
        return;
    }

    /** 
     *  Converts an action to a redux action that can be dispatched.
     */
    toRedux(): actions.Action {
        return {type: "PLACEHOLDER"};
    }
}

export class QuestAction extends Action {
    questId: model.QuestId;
    stage: model.QuestStage;
    // We can display a message in the event log as well, if it's a
    // long-running quest and we want to give the player reminders
    // about what happened and what's next. If we really care, we can
    // store an actual journal.
    journal: string | null;

    constructor(questId: model.QuestId, stage: model.QuestStage, journal?: string) {
        super();
        this.questId = questId;
        this.stage = stage;
        this.journal = journal || null;
    }
}

export class FlagAction extends Action {
    flag: string;
    value: boolean;

    constructor(flag: string, value: boolean) {
        super();
        this.flag = flag;
        this.value = value;
    }

    toRedux() {
        return actions.updateFlag(this.flag, this.value);
    }
}

export class ResourceAction extends Action {
    resource: string;
    value: number;

    constructor(resource: string, value: number) {
        super();
        this.resource = resource;
        this.value = value;
    }
}

export class Filter {
}

export class LocationFilter extends Filter {
    location: model.Location;

    constructor(location: model.Location) {
        super();
        this.location = location;
    }
}

export class QuestFilter extends Filter {
    quest: model.QuestId;
    stage: model.QuestStage;

    constructor(quest: model.QuestId, stage: model.QuestStage) {
        super();
        this.quest = quest;
        this.stage = stage;
    }
}

export class FlagFilter extends Filter {
    flag: string;
    value: boolean;

    constructor(flag: string, value: boolean) {
        super();
        this.flag = flag;
        this.value = value;
    }
}

export class Event {
    filters: Filter[];
    // TODO: temporary fix--we'll rename event actions later
    eactions: Action[];

    constructor(filters: Filter[], eactions: Action[]) {
        this.filters = filters;
        this.eactions = eactions;
    }
}

export class FlavorEvent extends Event {
    flavor: string;

    constructor(filters: Filter[], eactions: Action[], flavor: string) {
        super(filters, eactions);
        this.flavor = flavor;
    }
}

export class QuestionEvent extends Event {
    question: question.Question;
    failureActions: Action[];

    constructor(filters: Filter[], eactions: Action[], q: question.Question,
                failureActions: Action[]) {
        super(filters, eactions);
        this.question = q;
        this.failureActions = failureActions;
    }
}
