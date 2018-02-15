import * as model from "./model";
import * as question from "./question";

export class Action {
    // TODO: this signature needs to be more precise
    apply(store: model.Store) {
        return;
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

export class Event {
    filters: Filter[];
    actions: Action[];

    constructor(filters: Filter[], actions: Action[]) {
        this.filters = filters;
        this.actions = actions;
    }
}

export class FlavorEvent extends Event {
    flavor: string;

    constructor(filters: Filter[], actions: Action[], flavor: string) {
        super(filters, actions);
        this.flavor = flavor;
    }
}

export class QuestionEvent extends Event {
    question: question.Question;
    failureActions: Action[];

    constructor(filters: Filter[], actions: Action[], q: question.Question,
                failureActions: Action[]) {
        super(filters, actions);
        this.question = q;
        this.failureActions = failureActions;
    }
}
