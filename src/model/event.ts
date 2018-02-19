import * as model from "./model";
import * as question from "./question";
import * as actions from "../actions/actions";

import { hiraganaBasicDict } from "../model/kana";

export class Effect {
    // TODO: this signature needs to be more precise
    apply(store: model.Store) {
        return;
    }

    /** 
     *  Converts an effect to a redux action that can be dispatched.
     */
    toAction(): actions.Action {
        return {type: "PLACEHOLDER"};
    }
}

export class QuestEffect extends Effect {
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

export class FlagEffect extends Effect {
    flag: string;
    value: boolean;

    constructor(flag: string, value: boolean) {
        super();
        this.flag = flag;
        this.value = value;
    }

    toAction() {
        return actions.updateFlag(this.flag, this.value);
    }
}

export class ResourceEffect extends Effect {
    resource: string;
    value: number;

    constructor(resource: string, value: number) {
        super();
        this.resource = resource;
        this.value = value;
    }
}

/** An effect that represents learning a new word. */
export class LearnEffect extends Effect {
    id: model.LearnableId;

    constructor(id: model.LearnableId) {
        super();
        this.id = id;
    }

    toAction() {
        // TODO: this is currently hard-coded for hiragana
        return actions.learn(hiraganaBasicDict.get(this.id));
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
    effects: Effect[];

    constructor(filters: Filter[], effects: Effect[]) {
        this.filters = filters;
        this.effects = effects;
    }
}

export class FlavorEvent extends Event {
    flavor: string;

    constructor(filters: Filter[], effects: Effect[], flavor: string) {
        super(filters, effects);
        this.flavor = flavor;
    }
}

export class QuestionEvent extends Event {
    question: question.Question;
    failureEffects: Effect[];

    constructor(filters: Filter[], effects: Effect[], q: question.Question,
                failureEffects: Effect[]) {
        super(filters, effects);
        this.question = q;
        this.failureEffects = failureEffects;
    }
}
