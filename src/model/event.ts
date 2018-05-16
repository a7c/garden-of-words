import * as model from "./model";
import * as question from "./question";
import * as actions from "../actions/actions";
import * as lookup from "./lookup";

export class Filter {
    check(store: model.Store): boolean {
        return true;
    }
}

/** A composite filter that requires all the inner filters to check as false. */
export class NotFilter {
    filters: Filter[];

    constructor(filters: Filter[]) {
        this.filters = filters;
    }

    check(store: model.Store): boolean {
        return this.filters.map(f => f.check(store)).every(x => !x);
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
        else if (this.flag.slice(0, 14) === "started-quest:") {
            return store.quests.has(this.flag.slice(14)) === this.value;
        }
        else if (this.flag.startsWith("completed-checklist:")) {
            const [ _, questId, stage ] = this.flag.split(":");
            const quest = lookup.getQuest(questId);
            const checklist = quest.checklists.get(stage);
            if (checklist) {
                for (const { filter } of checklist) {
                    if (!filter.check(store)) {
                        return false;
                    }
                }
                return true;
            }
            console.warn(`Checked checklist for ${questId} at ${stage}, but one isn't defined.`);
            return true;
        }
        else if (this.flag.startsWith("hat:")) {
            const [ _, hat ] = this.flag.split(":");
            return store.wardrobe.hats.contains(hat) === this.value;
        }
        else if (this.flag.startsWith("theme:")) {
            const [ _, theme ] = this.flag.split(":");
            return store.wardrobe.themes.contains(theme) === this.value;
        }
        else if (this.flag === "has-next-learnable") {
            return !!lookup.getNextLearnable(store) === this.value;
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

/**
 * A filter that requires the player to have achieved a certain average mastery score
 * across all learned items in a collection.
 */
export class AverageMasteryFilter extends Filter {
    collection: model.CollectionId;
    masteryNeeded: number;

    constructor(collection: model.CollectionId, masteryNeeded: number) {
        super();
        this.collection = collection;
        this.masteryNeeded = masteryNeeded;
    }

    check(store: model.Store) {
        const collection = store.collections.get(this.collection);
        if (collection) {
            const sumScore = collection.reduce(
                (acc, id) => {
                    // Why do I need to do these undefined checks? /:
                    if (acc === undefined) {
                        return 0;
                    }
                    if (id === undefined) {
                        return acc;
                    }
                    const learned = store.learned.get(id);
                    return learned ? acc + learned.score : acc;
                },
                0
            );

            const avgScore = sumScore / collection.size;
            console.log(`sum score: ${sumScore}`);
            console.log(`size: ${collection.size}`);
            console.log(`avg score: ${avgScore}`);
            return avgScore >= this.masteryNeeded;
        }
        // Either player hasn't learned anything from the collection yet or the collection doesn't exist
        else {
            return false;
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
    toEventLog(): model.LogItem | null {
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
        if (this.flag.startsWith("hat:")) {
            const [ _, hat ] = this.flag.split(":");
            if (this.value) {
                return actions.hatify(hat);
            }
            return actions.hatify(null);
        }
        return actions.updateFlag(this.flag, this.value);
    }

    toEventLog() {
        if (this.flag.startsWith("hat:")) {
            const [ _, hat ] = this.flag.split(":");
            return `You put on the ${hat}.`;
        }
        return null;
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
        return {
            body: "",
            annotations: [],
            notes: [`You discovered ${locations.getLocation(this.location).name}.`],
        };
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
        return {
            body: "",
            annotations: [`${this.value > 0 ? "+" : "-"}${Math.abs(this.value)} max ${this.resource}`],
            notes: [],
        };
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
        return {
            body: "",
            annotations: [`${this.value > 0 ? "+" : "-"}${Math.abs(this.value)} ${this.resource}`],
            notes: [],
        };
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
        return {
            body: "",
            annotations: [],
            notes: [`You learned ${learnable.front} ${phrase} ${learnable.back}.`],
        };
    }
}

/**
 *  An effect that selects the an unlearned learnable from the given collection.
 *  LearnNextEffect needs to be initialized with a store before it can be used.
 */
export class LearnNextEffect extends LearnEffect {
    // TODO: this is not used atm
    collection: model.CollectionId;

    constructor(collection: model.CollectionId, customLogMessage?: string) {
        super("", customLogMessage);
        this.collection = collection;
    }

    init(store: model.Store) {
        const learnable = lookup.getNextLearnable(store);
        if (learnable !== null) {
            this.id = learnable;
        }
        else {
            console.warn("LearnNextEffect#init: Tried to initialize but no next learnable could be found!");
        }
    }

    toAction() {
        // If uninitialized or can't get another learnable, then do nothing
        if (this.id === "") {
            console.warn("LearnNextEffect#toAction: Not initialized or no next learnable could be found!");
            return {type: "PLACEHOLDER"};
        }
        return super.toAction();
    }

    toEventLog() {
        // If uninitialized or can't get another learnable, then do nothing
        if (this.id === "") {
            console.warn("LearnNextEffect#toEventLog: Not initialized or no next learnable could be found!");
            return "";
        }
        return super.toEventLog();
    }
}

export class ThemeEffect extends Effect {
    theme: string;

    constructor(theme: string) {
        super();
        this.theme = theme;
    }

    toAction() {
        (document.body.classList as any) //tslint:disable-line
            .forEach((klass: any) => document.body.classList.remove(klass)); //tslint:disable-line
        document.body.classList.add(this.theme);
        return actions.theme(this.theme);
    }

    toEventLog() {
        return "Your world changes color.";
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

    /** Whether to display the event text in a prompt window. */
    showEvent: boolean;
    /** Whether this event allows viewing the collections tab and other tabs. */
    allowNavigation: boolean;

    static effectsToText(efs: Effect[]): model.LogItem | null {
        const effects: model.LogItem[] = [];
        efs.forEach((ef) => {
            const el = ef.toEventLog();
            if (el) {
                effects.push(el);
            }
        });
        if (effects.length > 0) {
            return model.mergeLogItems(effects);
        }
        return null;
    }

    constructor(filters: Filter[], effects: Effect[], showEvent?: boolean) {
        this.filters = filters;
        this.effects = effects;
        this.showEvent = showEvent === undefined ? true : showEvent;
        this.allowNavigation = false;
    }

    check(store: model.Store): boolean {
        for (const filter of this.filters) {
            if (!filter.check(store)) {
                return false;
            }
        }
        return true;
    }

    toEventLog(): model.LogItem | null {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return effectText;
        }
        return "DEFAULT PLACEHOLDER TEXT";
    }

    toPostEventLog(): model.LogItem | null {
        return null;
    }

    clone(): Event {
        throw `Unimplemented!`;
    }
}

export class FlavorEvent extends Event {
    flavor: string;

    constructor(filters: Filter[], effects: Effect[], flavor: string, showEvent?: boolean) {
        super(filters, effects, showEvent === undefined ? false : showEvent);
        this.flavor = flavor;
    }

    toEventLog(): model.LogItem {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return model.mergeLogItems([ this.flavor, effectText ]);
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
    sequence: number | null;

    constructor(filters: Filter[],
                effects: Effect[],
                q: question.QuestionTemplate | question.Question,
                flavor: string | null,
                postFlavor: string | null,
                correctPostFlavor: string | null,
                wrongPostFlavor: string | null,
                failureEffects: Effect[],
                sequence: number | null = null) {
        super(filters, effects, true);
        this.question = q;
        this.flavor = flavor;
        this.postFlavor = postFlavor;
        this.correctPostFlavor = correctPostFlavor;
        this.wrongPostFlavor = wrongPostFlavor;
        this.failureEffects = failureEffects;
        this.sequence = sequence;
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
            const text = this.correctPostFlavor ? this.correctPostFlavor : "";
            if (effectText) {
                return model.mergeLogItems([ text, effectText ]);
            }
            return text;
        }
        else {
            const effectText = Event.effectsToText(this.failureEffects);
            const text = this.wrongPostFlavor ? this.wrongPostFlavor : "";
            if (effectText) {
                return model.mergeLogItems([ text, effectText ]);
            }
            return text;
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
                                 this.failureEffects.slice(),
                                 this.sequence);
    }
}

export class QuestEvent extends Event {
    journal: string;
    quest: model.QuestId;
    stage: model.QuestStage;

    constructor(filters: Filter[], effects: Effect[],
                journal: string, quest: model.QuestId, stage: model.QuestStage) {
        super(
            filters,
            effects.concat([
                new QuestEffect(quest, stage, journal)
            ]),
            true);
        this.journal = journal;
        this.quest = quest;
        this.stage = stage;
    }

    toEventLog(): model.LogItem {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return effectText;
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
    newQuest: boolean;

    constructor(quest: model.QuestId, stage: model.QuestStage, newQuest: boolean = false) {
        super([], [], true);
        this.quest = quest;
        this.stage = stage;
        this.newQuest = newQuest;
    }

    toEventLog(): model.LogItem {
        return lookup.getQuest(this.quest).journal.get(this.stage) || "";
    }

    clone() {
        return new QuestUpdatedEvent(this.quest, this.stage, this.newQuest);
    }
}

// Dummy event, just used for display
export class LearnedEvent extends Event {
    learnableIds: model.LearnableId[];

    constructor(learnableIds: model.LearnableId[]) {
        super([], [], true);
        this.learnableIds = learnableIds;
    }

    toEventLog() {
        return null;
    }

    clone() {
        return new LearnedEvent(this.learnableIds.slice());
    }
}

// Dummy event, just used for display
export class TextEvent extends Event {
    header: string;
    body: string;

    constructor(header: string, body: string) {
        super([], [], true);
        this.header = header;
        this.body = body;
    }

    toEventLog() {
        return null;
    }

    clone() {
        return new TextEvent(this.header, this.body);
    }
}

/**
 *  An composite event that chains together multiple events.
 *  The effects for the multi-event will resolve immediately. If you want to have
 *  effects that resolve after all the subevents are completed, put those effects
 *  as part of the last subevent.
 */
export class MultiEvent extends Event {
    events: Event[];
    currentIndex: number;

    constructor(filters: Filter[], effects: Effect[], events: Event[]) {
        super(filters, effects, false);
        this.events = events;
        this.currentIndex = 0;
    }

    getEvents(): Event[] {
        return this.events;
    }

    toEventLog(): model.LogItem {
        const effectText = Event.effectsToText(this.effects);
        if (effectText !== null) {
            return effectText;
        }
        return "";
    }

    clone() {
        return new MultiEvent(this.filters, this.effects, this.events);
    }
}

export interface PossibleEvent {
    event: Event;
    /** Represents the relative probability of being chosen, compared to other events in the set. */
    weight: number;
}

export interface PossibleEventSet {
    filters: Filter[];
    events: PossibleEvent[];
}

export class EventPipeline {
    eventSets: PossibleEventSet[];

    constructor(eventSets: PossibleEventSet[]) {
        this.eventSets = eventSets;
    }

    getRandomEvent(store: model.Store): Event {
        let currentEventSet: PossibleEventSet | null = null;
        // Select first event set that passes all filters
        for (const eventSet of this.eventSets) {
            if (eventSet.filters.map(f => f.check(store)).every(x => x)) {
                currentEventSet = eventSet;
                break;
            }
        }
        // If no event set is valid, return some filler event
        if (currentEventSet === null) {
            return new FlavorEvent([], [], "Nothing happens.");
        }

        const validEvents = currentEventSet.events.filter(
            possibleEvent => possibleEvent.event.filters.map(f => f.check(store)).every(x => x)
        );

        const totalWeight = validEvents.reduce(
            (acc, possibleEvent) => {
                return acc + possibleEvent.weight;
            },
            0
        );

        let rand = Math.floor(Math.random() * totalWeight) + 1;
        for (const possibleEvent of validEvents) {
            rand -= possibleEvent.weight;
            if (rand <= 0) {
                return possibleEvent.event;
            }
        }
        // If we couldn't select an event somehow, return filler event
        return new FlavorEvent([], [], "Nothing happens.");
    }
}
