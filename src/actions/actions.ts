import * as redux from "redux";
import * as model from "../model/model";

export const REVIEW = "review";
export const LEARN = "learn";
export const MEDITATE = "meditate";
export const UPDATE_FLAG = "update_flag";

export interface ReviewAction extends redux.AnyAction {
    type: typeof REVIEW;
    id: model.LearnableId;
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

export type Action = 
    | redux.AnyAction | ReviewAction | LearnAction | MeditateAction
    | UpdateFlagAction;

export function meditate(): Action {
  return { type: MEDITATE };
}

export function review(id: model.LearnableId): Action {
    return {
        type: REVIEW,
        id,
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
