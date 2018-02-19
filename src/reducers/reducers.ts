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

function collections(state: immutable.Set<model.Collection> = immutable.Set(), action: actions.Action): 
    immutable.Set<model.Collection> {
    switch (action.type) {
    case actions.LEARN: {
        const newState = state.add(action.item.id);
        console.log(newState.toArray());
        return newState;
    }
    default:
        return state;
    }
}

function resources(state: immutable.Map<model.Resource, number> = immutable.Map(), action: actions.Action): 
    immutable.Map<model.Resource, number> {
    switch (action.type) {
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
    quests: undefined
});

export const reducer = combineReducers(
    {
        learned,
        collections,
        resources,
        location,
        flags,
        quests
    }, 
    emptyStore
);
