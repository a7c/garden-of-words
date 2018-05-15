import * as event from "../model/event";
import * as lookup from "../model/lookup";
import * as model from "../model/model";
import * as quest from "../model/quest";
import * as question from "../model/question";

export class ParseError {
    message: string;
    object: Object;

    constructor(message: string, object: Object) {
        this.message = message;
        this.object = object;
    }
}

type EffectProps =
    { type: "quest", quest: model.QuestId, stage: model.QuestStage, journal?: string } |
    { type: "flag", flag: string, value: boolean } |
    { type: "discover", location: model.Location } |
    { type: "resource", resource: model.Resource, value: number, log?: string} |
    { type: "resource-max", resource: model.Resource, value: number } |
    { type: "learn", id: model.LearnableId } |
    { type: "theme", theme: string } |
    { type: "review-correct", id: model.LearnableId } |
    { type: "learn-next", collection: model.CollectionId };

type FilterProps =
    { type: "resource", resource: model.Resource, minimum: number } |
    { type: "vocabsize", collection: model.CollectionId, minimum: number } |
    { type: "location", location: model.Location } |
    { type: "know-location", location: model.Location } |
    { type: "flag", flag: string, value: boolean } |
    { type: "quest", quest: model.QuestId, stage: model.QuestStage } |
    { type: "or", filters: FilterProps[] } |
    { type: "not", filters: FilterProps[] } |
    { type: "structure-nearby", structure: string, distance?: number, exact?: boolean } |
    { type: "average-mastery", collection: model.CollectionId, masteryNeeded: number };

type QuestionTemplateProps =
    { type: "mc", collection: string, restrictLearnableTypes: string[], onlySeen?: boolean, reverse?: boolean } |
    { type: "mc-names", reverse?: boolean } |
    { type: "ti-vocab", collections: string[] } |
    { type: "ti-learn-vocab", collections: string[], onlySeenKana?: boolean };

type ExactQuestionProps = { type: "ti", id: model.LearnableId };

type EventProps =
    { type: "flavor", text: string, effects: EffectProps[], filters: FilterProps[], showEvent?: boolean } |
    { type: "quest", journal: string, quest: string, stage: string, effects: EffectProps[], filters: FilterProps[] } |
    { type: "question", effects: EffectProps[], filters: FilterProps[],
        question: QuestionTemplateProps | ExactQuestionProps,
        text?: string | null, postText?: string | null,
        correctPostText?: string | null, wrongPostText?: string | null,
        failureEffects: EffectProps[], sequence?: number | null } |
    { type: "multi", effects: EffectProps[], filters: FilterProps[], events: EventProps[] };

export type QuestProps = {
    id: model.QuestId,
    name: string,
    complete: model.QuestStage,
    events: {
        [ stage: string ]: EventProps[],
    },
    journal: {
        [ stage: string ]: string,
    },
    checklists?: {
        [ stage: string ]: {
            description: string,
            hiddenDescription?: string,
            filter: FilterProps,
        }[],
    },
};

export type PossibleEventProps = {
    event: EventProps,
    weight: number
};

export type PossibleEventSetProps = {
    filters: FilterProps[],
    events: PossibleEventProps[]
};

export type EventPipelineProps = PossibleEventSetProps[];

export function parseEffect(json: EffectProps): event.Effect {
    if (json.type === "flag") {
        return new event.FlagEffect(json.flag, json.value);
    }
    if (json.type === "discover") {
        return new event.DiscoverEffect(json.location);
    }
    else if (json.type === "resource") {
        return new event.ResourceEffect(json.resource, json.value, json.log);
    }
    else if (json.type === "resource-max") {
        return new event.ResourceMaxEffect(json.resource, json.value);
    }
    else if (json.type === "quest") {
        return new event.QuestEffect(json.quest, json.stage, json.journal);
    }
    else if (json.type === "learn") {
        return new event.LearnEffect(json.id);
    }
    else if (json.type === "theme") {
        return new event.ThemeEffect(json.theme);
    }
    else if (json.type === "review-correct") {
        return new event.ReviewCorrectEffect(json.id);
    }
    else if (json.type === "learn-next") {
        return new event.LearnNextEffect(json.collection);
    }
    throw new ParseError("Unrecognized effect", json);
}

export function parseFilter(json: FilterProps): event.Filter {
    if (json.type === "flag") {
        return new event.FlagFilter(json.flag, json.value);
    }
    else if (json.type === "location") {
        return new event.LocationFilter(json.location);
    }
    else if (json.type === "know-location") {
        return new event.KnowLocationFilter(json.location);
    }
    else if (json.type === "quest") {
        return new event.QuestFilter(json.quest, json.stage);
    }
    else if (json.type === "resource") {
        return new event.ResourceFilter(json.resource, json.minimum);
    }
    else if (json.type === "vocabsize") {
        return new event.VocabSizeFilter(json.collection, json.minimum);
    }
    else if (json.type === "structure-nearby") {
        return new event.StructureNearbyFilter(json.structure, json.distance, json.exact);
    }
    else if (json.type === "or") {
        return new event.OrFilter(json.filters.map(parseFilter));
    }
    else if (json.type === "not") {
        return new event.NotFilter(json.filters.map(parseFilter));
    }
    else if (json.type === "average-mastery") {
        return new event.AverageMasteryFilter(json.collection, json.masteryNeeded);
    }

    throw new ParseError("Unrecognized filter", json);
}

export function parseEvent(json: EventProps): event.Event {
    if (json.type === "flavor") {
        return new event.FlavorEvent(
            json.filters.map(parseFilter),
            json.effects.map(parseEffect),
            json.text,
            json.showEvent
        );
    }
    else if (json.type === "quest") {
        return new event.QuestEvent(
            json.filters.map(parseFilter),
            json.effects.map(parseEffect),
            json.journal,
            json.quest,
            json.stage
        );
    }
    else if (json.type === "question") {
        return new event.QuestionEvent(
            json.filters.map(parseFilter),
            json.effects.map(parseEffect),
            parseQuestionTemplate(json.question),
            json.text || null,
            json.postText || null,
            json.correctPostText || null,
            json.wrongPostText || null,
            json.failureEffects.map(parseEffect),
            json.sequence || null
        );
    }
    else if (json.type === "multi") {
        return new event.MultiEvent(
            json.filters.map(parseFilter),
            json.effects.map(parseEffect),
            json.events.map(parseEvent)
        );
    }
    throw new ParseError("Unrecognized event", json);
}

export function parseQuest(json: QuestProps): quest.Quest {
    const events = new Map();
    const journal = new Map();
    const checklists: Map<model.QuestStage, quest.Checklist> = new Map();
    for (const stage of Object.keys(json.events)) {
        events.set(stage, json.events[stage].map(parseEvent));
    }
    for (const stage of Object.keys(json.journal)) {
        journal.set(stage, json.journal[stage]);
    }
    if (json.checklists) {
        for (const stage of Object.keys(json.checklists)) {
            const checklist = json.checklists[stage].map(ck => ({
                description: ck.description,
                hiddenDescription: ck.hiddenDescription,
                filter: parseFilter(ck.filter),
            }));
            checklists.set(stage, checklist);
        }
    }
    return new quest.Quest(json.id, json.name, events, journal, checklists, json.complete);
}

export function parseQuestionTemplate(json: QuestionTemplateProps | ExactQuestionProps):
question.QuestionTemplate | question.Question {
    if (json.type === "mc") {
        return new question.MultipleChoiceQuestionTemplate(
            json.collection,
            json.restrictLearnableTypes || [],
            json.onlySeen || false,
            json.reverse || false
        );
    }
    else if (json.type === "mc-names") {
        return new question.MultipleChoiceNameQuestionTemplate(
            json.reverse || false
        );
    }
    else if (json.type === "ti-vocab") {
        return new question.TypeInVocabTemplate(json.collections);
    }
    else if (json.type === "ti-learn-vocab") {
        return new question.TypeInLearnVocabTemplate(
            json.collections,
            json.onlySeenKana || false);
    }
    else if (json.type === "ti") {
        return new question.TypeIn([ json.id ], lookup.getLearnable(json.id));
    }

    throw new ParseError("Unrecognized question template", json);
}

// TODO: reduce boilerplate of these functions (and the props above)?

export function parsePossibleEvent(json: PossibleEventProps): event.PossibleEvent {
    return {
        weight: json.weight,
        event: parseEvent(json.event)
    };
}

export function parsePossibleEventSet(json: PossibleEventSetProps): event.PossibleEventSet {
    return {
        filters: json.filters.map(parseFilter),
        events: json.events.map(parsePossibleEvent)
    };
}

export function parseEventPipeline(json: EventPipelineProps): event.EventPipeline {
    return new event.EventPipeline(json.map(parsePossibleEventSet));
}
