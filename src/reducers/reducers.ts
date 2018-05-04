import { combineReducers } from "redux-immutable";
import * as immutable from "immutable";

import * as model from "../model/model";
import * as lookup from "../model/lookup";
import * as actions from "../actions/actions";

function learned(state: immutable.Map<model.LearnableId, model.Learned> = immutable.Map(), action: actions.Action):
    immutable.Map<model.LearnableId, model.Learned> {
    switch (action.type) {
    case actions.LEARN: {
        return state.set(action.item, new model.Learned({
            item: action.item,
            lastReviewed: new Date(),
            score: 0.0,
        }));
    }
    case actions.REVIEW: {
        const learnedItem = state.get(action.id);
        if (learnedItem === undefined) {
            console.warn(`'learned' reducer received REVIEW action for id ${action.id}
                but haven't learned that yet!`);
            return state;
        }
        const scoreEarned = action.correct ? 10 : -10;
        const newScore = Math.max(0, Math.min(100, learnedItem.get("score") + scoreEarned));
        const updatedLearned = learnedItem
            .set("score", newScore)
            .set("lastReviewed", new Date());

        return state.set(action.id, updatedLearned);
    }
    default:
        return state;
    }
}

function collections(
    state: immutable.Map<model.CollectionId, model.Collection> = immutable.Map(),
    action: actions.Action): immutable.Map<model.CollectionId, model.Collection> {
    switch (action.type) {
    case actions.LEARN: {
        const learnable = lookup.getLearnable(action.item);
        if (learnable) {
            const collectionName = learnable.collection;

            // Check whether player already has this collection and update accordingly
            if (state.has(collectionName)) {
                const collection = state.get(collectionName);
                return state.set(collectionName, collection.add(action.item));
            }
            else {
                return state.set(collectionName, immutable.Set([action.item]));
            }
        }
        else {
            console.warn(`Tried to learn learnable with id ${action.item} but it doesn't exist!`);
            return state;
        }
    }
    default:
        return state;
    }
}

function resources(state: immutable.Map<model.Resource, model.ResourceProps> = immutable.Map(), action: actions.Action):
    immutable.Map<model.Resource, model.ResourceProps> {
    switch (action.type) {
    case actions.MODIFY_RESOURCE: {
        const origProps = state.has(action.resource) ?
            state.get(action.resource) : model.defaultResourceProps;

        let newValue = origProps.currentValue + action.value;
        if (origProps.maxValue && newValue > origProps.maxValue) {
            newValue = origProps.maxValue;
        }

        const props = {
            currentValue: newValue,
            maxValue: origProps.maxValue
        };

        return state.set(action.resource, props);
    }
    case actions.MODIFY_RESOURCE_MAX: {
        const origProps = state.has(action.resource) ?
            state.get(action.resource) : model.defaultResourceProps;

        const props = {
            currentValue: origProps.currentValue,
            maxValue: origProps.maxValue + action.value
        };

        return state.set(action.resource, props);
    }
    default:
        return state;
    }
}

function location(
    state: model.LocationRecord = new model.LocationRecord(),
    action: actions.Action
): model.LocationRecord {
    switch (action.type) {
    case actions.DISCOVER:
        return state.set("discovered", state.discovered.add(action.location));
    case actions.TRAVEL:
        return state.set("current", action.location);
    default:
        return state;
    }
}

function flags(state: immutable.Map<model.Flag, model.FlagValue> = immutable.Map(), action: actions.Action):
    immutable.Map<model.Flag, model.FlagValue> {
    switch (action.type) {
    case actions.UPDATE_FLAG: {
        return state.set(action.flag, action.value);
    }
    default:
        return state;
    }
}

function quests(state: immutable.Map<model.QuestId, model.QuestStage> = immutable.Map(), action: actions.Action):
    immutable.Map<model.QuestId, model.QuestStage> {
    switch (action.type) {
    case actions.UPDATE_QUEST:
        return state.set(action.quest, action.stage);
    default:
        return state;
    }
}

function wardrobe(
    state: model.WardrobeRecord = new model.WardrobeRecord(),
    action: actions.Action
): model.WardrobeRecord {
    switch (action.type) {
    case actions.THEME:
        return state
            .set("currentTheme", action.theme)
            .set("themes", state.themes.add(action.theme));
    default:
        return state;
    }
}

/**
 *  Keeps track of the number of wander actions that have occurred so far in the current location.
 *  Used to update the scene panel.
 */
function steps(state: number = 0, action: actions.Action): number {
    switch (action.type) {
    case actions.WANDER: {
        return state + 1;
    }
    default:
        return state;
    }
}

// Delegate default state to the subreducers
const emptyStore = immutable.Record({
    learned: undefined,
    collections: undefined,
    resources: undefined,
    location: undefined,
    flags: undefined,
    quests: undefined,
    wardrobe: undefined,
    steps: undefined,
});

export const reducer = combineReducers<model.Store, string>(
    {
        learned,
        collections,
        resources,
        location,
        flags,
        quests,
        wardrobe,
        steps
    },
    emptyStore
);
