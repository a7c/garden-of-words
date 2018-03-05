import * as model from "./model";
import * as question from "./question";
import * as actions from "../actions/actions";
import * as lookup from "./lookup";

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

    toAction() {
        return actions.updateQuest(this.questId, this.stage);
    }

    toEventLog() {
        return this.journal;
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

export class DiscoverEffect extends Effect {
    location: model.Location;

    constructor(location: model.Location) {
        super();
        this.location = location;
    }

    toAction() {
        return actions.discover(this.location);
    }
}

export class ResourceMaxEffect extends Effect {
    resource: model.Resource;
    value: number;

    constructor(resource: model.Resource, value: number) {
        super();
        this.resource = resource;
        this.value = value;
    }

    toAction() {
        return actions.modifyResourceMax(this.resource, this.value);
    }

    toEventLog() {
        return `You gained ${this.value} maximum of ${this.resource}.`;
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

    toEventLog() {
        return `You ${this.value > 0 ? "gained" : "lost"} ${Math.abs(this.value)} ${this.resource}.`;
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
        return actions.learn(lookup.getLearnable(this.id));
    }

    toEventLog() {
        const learnable = lookup.getLearnable(this.id);
        return `You learned ${learnable.front()} means ${learnable.back()}.`;
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

    check(store: model.Store) {
        return store.location.current === this.location;
    }
}

export class KnowLocationFilter extends Filter {
    location: model.Location;

    constructor(location: model.Location) {
        super();
        this.location = location;
    }

    check(store: model.Store) {
        return store.location.discovered.includes(this.location);
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

    check(store: model.Store): boolean {
        return store.quests.get(this.quest) === this.stage;
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

    check(store: model.Store): boolean {
        const actualValue = store.flags.get(this.flag);
        // Cast to boolean
        return !!actualValue === this.value;
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
        const resourceProps = store.resources.get(this.resource);
        if (resourceProps) {
            const val = resourceProps.currentValue;
            return val >= this.minimum;
        }
        return false;
    }
}

export class VocabSizeFilter extends Filter {
    collection: model.CollectionId;
    size: number;

    constructor(collection: model.CollectionId, size: number) {
        super();
        this.collection = collection;
        this.size = size;
    }

    check(store: model.Store): boolean {
        const val = store.collections.get(this.collection);
        return val && val.size >= this.size;
    }
}

export class Event {
    filters: Filter[];
    effects: Effect[];

    static effectsToText(efs: Effect[]): string | null {
        const effects: string[] = [];
        efs.forEach((ef) => {
            const el = ef.toEventLog();
            if (el) {
                effects.push(el);
            }
        });
        if (effects.length > 0) {
            return effects.join(" ");
        }
        return null;
    }

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

    toEventLog(): string | null {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return effectText;
        }
        return "DEFAULT PLACEHOLDER TEXT";
    }

    toPostEventLog(): string | null {
        return null;
    }
}

export class FlavorEvent extends Event {
    flavor: string;

    constructor(filters: Filter[], effects: Effect[], flavor: string) {
        super(filters, effects);
        this.flavor = flavor;
    }

    toEventLog(): string {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return `${this.flavor} ${effectText}`;
        }
        return this.flavor;
    }
}

export class QuestionEvent extends Event {
    question: question.QuestionTemplate;
    failureEffects: Effect[];
    flavor: string | null;
    postFlavor: string | null;
    correctPostFlavor: string | null;
    wrongPostFlavor: string | null;

    constructor(filters: Filter[],
                effects: Effect[],
                q: question.QuestionTemplate,
                flavor: string | null,
                postFlavor: string | null,
                correctPostFlavor: string | null,
                wrongPostFlavor: string | null,
                failureEffects: Effect[]) {
        super(filters, effects);
        this.question = q;
        this.flavor = flavor;
        this.postFlavor = postFlavor;
        this.correctPostFlavor = correctPostFlavor;
        this.wrongPostFlavor = wrongPostFlavor;
        this.failureEffects = failureEffects;
    }

    toEventLog() {
        return this.flavor;
    }

    toPostEventLog() {
        return null;
    }

    toResultEventLog(correct: boolean) {
        if (correct) {
            const effectText = Event.effectsToText(this.effects);
            return `${this.correctPostFlavor ? this.correctPostFlavor : ""} ${effectText ? effectText : ""}`;
        }
        else {
            const effectText = Event.effectsToText(this.failureEffects);
            return `${this.wrongPostFlavor ? this.wrongPostFlavor : ""} ${effectText ? effectText : ""}`;
        }
    }
}
