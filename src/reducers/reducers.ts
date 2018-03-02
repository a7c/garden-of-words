import { combineReducers } from "redux-immutable";
import * as immutable from "immutable";

import * as model from "../model/model";
import * as actions from "../actions/actions";

function learned(state: immutable.Map<model.LearnableId, model.Learned> = immutable.Map(), action: actions.Action):
    immutable.Map<model.LearnableId, model.Learned> {
    switch (action.type) {
    case actions.LEARN: {
        return state.set(action.item.id, new model.Learned({
            item: action.item,
            lastReviewed: new Date(),
            score: 0.0,
        }));
    }
    case actions.REVIEW: {
        const learnedItem = state.get(action.id);
        const scoreEarned = action.correct ? Math.random() : 0;
        const updatedLearned = learnedItem.set("score", learnedItem.get("score") + scoreEarned)
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
        const collectionName = action.item.collection;

        // Check whether player already has this collection and update accordingly
        if (state.has(collectionName)) {
            const collection = state.get(collectionName);
            return state.set(collectionName, collection.add(action.item.id));
        }
        else {
            return state.set(collectionName, immutable.Set([action.item.id]));
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

        const origValue = state.has(action.resource) ?
            state.get(action.resource).currentValue : 0;

        let addValue: number;
        if (action.newValue) {
            addValue = action.newValue;
        } else {
            addValue = 0;
        }

        let newValue = addValue + origValue;

        let max: number = 0;
        let hasMax: boolean;

        if (action.newMaxValue) {
            max = action.newMaxValue;
            hasMax = true;
        } else if (state.has(action.resource) && state.get(action.resource).maxValue) {
            max = state.get(action.resource).maxValue!;
            hasMax = true;
        } else {
            hasMax = false;
        }

        let props: model.ResourceProps;
        if (hasMax) {
            props = { currentValue: newValue, maxValue: max };
        } else {
            props = { currentValue: newValue };
        }

        return state.set(action.resource, props);
    }
    default:
        return state;
    }
}

function location(state: model.Location = "nowhere", action: actions.Action): model.Location {
    switch (action.type) {
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
    steps: undefined
});

export const reducer = combineReducers(
    {
        learned,
        collections,
        resources,
        location,
        flags,
        quests,
        steps
    },
    emptyStore
);
