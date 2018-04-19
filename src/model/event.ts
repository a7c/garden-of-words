import * as model from "./model";
import * as question from "./question";
import * as actions from "../actions/actions";
import * as lookup from "./lookup";

export class Filter {
    check(store: model.Store): boolean {
        return true;
    }
}

export class OrFilter {
    filters: Filter[];

    constructor(filters: Filter[]) {
        this.filters = filters;
    }

    check(store: model.Store): boolean {
        return this.filters.map(f => f.check(store)).some(x => x);
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
        if (this.flag.slice(0, 11) === "discovered:") {
            // Actually querying whether we've discovered a place
            return !!model.locationDiscovered(store, this.flag.slice(11)) === this.value;
        }
        else if (this.flag.slice(0, 5) === "know:") {
            // Actually querying whether we know a certain word
            return store.learned.has(this.flag.slice(5)) === this.value;
        }
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

// Has to go here due to circular imports >.>
import * as locations from "../data/locations";

/** A filter that requires the player to be near the specified structure. */
export class StructureNearbyFilter extends Filter {
    structureRequired: string;
    /** Number of steps until structure is right in front of player */
    distanceRequired: number;
    /**
     *  True if we should check if the structure is exactly [distance] steps ahead,
     *  false for less than or equal to
     */
    exact: boolean;

    constructor(structure: string, distance: number = 0, exact: boolean = false) {
        super();
        this.structureRequired = structure;
        this.distanceRequired = distance;
        this.exact = exact;
    }

    // TODO: this whole thing could be optimized but is it worth it? (no)
    check(store: model.Store): boolean {
        const { steps, location } = store;
        const structures = locations.getLocation(location.current).structures;

        const playerIndex = steps % structures.length;

        // There could be multiples of the structure, so find the closest one
        let minDist = null;
        for (let i = 0; i < structures.length; i++) {
            const struct = structures[i];
            if (struct === this.structureRequired) {
                const dist = (i - playerIndex) % structures.length;
                if (minDist) {
                    if (dist < minDist) {
                        minDist = dist;
                    }
                }
                else {
                    minDist = dist;
                }
            }
        }

        // structure not found
        if (minDist === null) {
            throw `StructureNearbyFilter could not find the structure
                ${this.structureRequired} in location ${location.current}`;
        }

        // Add one step because the filter check occurs BEFORE the step takes place
        if (this.exact) {
            return minDist === this.distanceRequired + 1;
        }
        else {
            return minDist <= this.distanceRequired + 1;
        }

    }
}

export class Effect {
    /**
     *  A custom log message to be displayed. If null, a default message (or no
     *  message) will be displayed in the event log.
     */
    customLogMessage: string | null;

    constructor(customLogMessage?: string) {
        // Empty string is a valid custom log message
        if (customLogMessage !== undefined) {
            this.customLogMessage = customLogMessage;
        }
        else {
            this.customLogMessage = null;
        }
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
        return this.customLogMessage;
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
        super(journal);
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

    constructor(flag: string, value: boolean, customLogMessage?: string) {
        super(customLogMessage);
        this.flag = flag;
        this.value = value;
    }

    toAction() {
        return actions.updateFlag(this.flag, this.value);
    }
}

export class TravelEffect extends Effect {
    location: model.Location;

    constructor(location: model.Location, customLogMessage?: string) {
        super(customLogMessage);
        this.location = location;
    }

    toAction() {
        return actions.travel(this.location);
    }

    toEventLog() {
        if (this.customLogMessage !== null) {
            return super.toEventLog();
        }
        return `You walk to ${locations.getLocation(this.location).name}.`;
    }
}

export class DiscoverEffect extends Effect {
    location: model.Location;

    constructor(location: model.Location, customLogMessage?: string) {
        super(customLogMessage);
        this.location = location;
    }

    toAction() {
        return actions.discover(this.location);
    }

    toEventLog() {
        if (this.customLogMessage !== null) {
            return super.toEventLog();
        }
        return `You discovered ${locations.getLocation(this.location).name}.`;
    }
}

export class ResourceMaxEffect extends Effect {
    resource: model.Resource;
    value: number;

    constructor(resource: model.Resource, value: number, customLogMessage?: string) {
        super(customLogMessage);
        this.resource = resource;
        this.value = value;
    }

    toAction() {
        return actions.modifyResourceMax(this.resource, this.value);
    }

    toEventLog() {
        if (this.customLogMessage !== null) {
            return super.toEventLog();
        }
        return `You gained ${this.value} maximum ${this.resource}.`;
    }
}

export class ResourceEffect extends Effect {
    resource: model.Resource;
    value: number;

    constructor(resource: model.Resource, value: number, customLogMessage?: string) {
        super(customLogMessage);
        this.resource = resource;
        this.value = value;
    }

    toAction() {
        return actions.modifyResource(this.resource, this.value);
    }

    toEventLog() {
        if (this.customLogMessage !== null) {
            return super.toEventLog();
        }
        return `You ${this.value > 0 ? "gained" : "lost"} ${Math.abs(this.value)} ${this.resource}.`;
    }
}

/** An effect that represents learning a new word. */
export class LearnEffect extends Effect {
    id: model.LearnableId;

    constructor(id: model.LearnableId, customLogMessage?: string) {
        super(customLogMessage);
        this.id = id;
    }

    toAction() {
        return actions.learn(this.id);
    }

    toEventLog() {
        if (this.customLogMessage !== null) {
            return super.toEventLog();
        }

        const learnable = lookup.getLearnable(this.id);

        const phrase = {
            "hiragana": "is pronounced",
            "katakana": "is pronounced",
            "vocab-kana-romaji": "is read",
        }[learnable.type] || "means";

        // TODO: factor out this check
        return `You learned ${learnable.front} ${phrase} ${learnable.back}.`;
    }
}

/** An effect that represents correctly reviewing an already learned word. */
export class ReviewCorrectEffect extends Effect {
    id: model.LearnableId;

    constructor(id: model.LearnableId, customLogMessage?: string) {
        super(customLogMessage);
        this.id = id;
    }

    toAction() {
        return actions.review(this.id, true);
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

    clone(): Event {
        throw `Unimplemented!`;
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

    clone() {
        return new FlavorEvent(this.filters.slice(),
                               this.effects.slice(),
                               this.flavor);
    }
}

export class QuestionEvent extends Event {
    question: question.QuestionTemplate | question.Question;
    failureEffects: Effect[];
    flavor: string | null;
    postFlavor: string | null;
    correctPostFlavor: string | null;
    wrongPostFlavor: string | null;

    constructor(filters: Filter[],
                effects: Effect[],
                q: question.QuestionTemplate | question.Question,
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

    clone() {
        return new QuestionEvent(this.filters.slice(),
                                 this.effects.slice(),
                                 this.question,
                                 this.flavor,
                                 this.postFlavor,
                                 this.correctPostFlavor,
                                 this.wrongPostFlavor,
                                 this.failureEffects.slice());
    }
}

export class QuestEvent extends Event {
    journal: string;
    quest: model.QuestId;
    stage: model.QuestStage;

    constructor(filters: Filter[], effects: Effect[],
                journal: string, quest: model.QuestId, stage: model.QuestStage) {
        super(filters, effects.concat([
            new QuestEffect(quest, stage, journal)
        ]));
        this.journal = journal;
        this.quest = quest;
        this.stage = stage;
    }

    toEventLog(): string {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return `${effectText}`;
        }
        // This should never happen
        return "";
    }

    clone() {
        return new QuestEvent(this.filters.slice(),
                              this.effects.slice(0, -1),
                              this.journal,
                              this.quest,
                              this.stage);
    }
}

// Dummy event, just used for display
export class QuestUpdatedEvent extends Event {
    quest: model.QuestId;
    stage: model.QuestStage;

    constructor(quest: model.QuestId, stage: model.QuestStage) {
        super([], []);
        this.quest = quest;
        this.stage = stage;
    }

    toEventLog(): string {
        return lookup.getQuest(this.quest).journal.get(this.stage) || "";
    }

    clone() {
        return new QuestUpdatedEvent(this.quest, this.stage);
    }
}
