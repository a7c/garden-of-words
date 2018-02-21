import * as redux from "redux";
import * as model from "../model/model";

export const REVIEW = "review";
export const LEARN = "learn";
export const MEDITATE = "meditate";
export const UPDATE_FLAG = "update_flag";
export const WANDER = "wander";

export interface ReviewAction extends redux.AnyAction {
    type: typeof REVIEW;
    id: model.LearnableId;
    correct: boolean;
}

export interface MeditateAction extends redux.AnyAction {
    type: typeof MEDITATE;
    id: model.LearnableId;
}

export interface LearnAction extends redux.AnyAction {
    type: typeof LEARN;
    item: model.Learnable;
}

export interface UpdateFlagAction extends redux.AnyAction {
    type: typeof UPDATE_FLAG;
    flag: model.Flag;
    value: model.FlagValue;
}

export interface WanderAction extends redux.AnyAction {
    type: typeof WANDER;
}

export type Action = 
    | redux.AnyAction | ReviewAction | LearnAction | MeditateAction
    | UpdateFlagAction | WanderAction;

export function meditate(): Action {
  return { type: MEDITATE };
}

export function review(id: model.LearnableId, correct: boolean): Action {
    return {
        type: REVIEW,
        id,
        correct
    };
}

export function learn(item: model.Learnable): Action {
    return {
        type: LEARN,
        item
    };
}

export function updateFlag(flag: model.Flag, value: model.FlagValue): Action {
    return {
        type: UPDATE_FLAG,
        flag,
        value
    };
}

export function wander(): Action {
    return {
        type: WANDER
    };
}
