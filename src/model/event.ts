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

    /**
     * Return what this event should display in the event log (if anything).
     */
    toEventLog(): string | null {
        return null;
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
    resource: model.Resource;
    value: number;

    constructor(resource: model.Resource, value: number) {
        super();
        this.resource = resource;
        this.value = value;
    }

    toAction() {
        return actions.modifyResource(this.resource, this.value);
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

    toEventLog() {
        // TODO: this is currently hard-coded for hiragana
        const hiragana = hiraganaBasicDict.get(this.id);
        return `You learned ${hiragana.front()} means ${hiragana.back()}.`;
    }
}

export class Filter {
    check(store: model.Store): boolean {
        return true;
    }
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

export class ResourceFilter extends Filter {
    resource: model.Resource;
    minimum: number;

    constructor(resource: model.Resource, value: number) {
        super();
        this.resource = resource;
        this.minimum = value;
    }

    check(store: model.Store): boolean {
        const val = store.resources.get(this.resource);
        return typeof val !== "undefined" && val >= this.minimum;
    }
}

export class Event {
    filters: Filter[];
    effects: Effect[];

    constructor(filters: Filter[], effects: Effect[]) {
        this.filters = filters;
        this.effects = effects;
    }

    check(store: model.Store): boolean {
        for (const filter of this.filters) {
            if (!filter.check(store)) {
                return false;
            }
        }
        return true;
    }

    toEventLog(): string {
        return "Something cool happened. It's Japan.";
    }
}

export class FlavorEvent extends Event {
    flavor: string;

    constructor(filters: Filter[], effects: Effect[], flavor: string) {
        super(filters, effects);
        this.flavor = flavor;
    }

    toEventLog(): string {
        const effects: string[] = [];
        this.effects.forEach((ef) => {
            const el = ef.toEventLog();
            if (el) {
                effects.push(el);
            }
        });
        if (effects.length > 0) {
            return this.flavor + " " + effects.join(" ");
        }
        return this.flavor;
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
