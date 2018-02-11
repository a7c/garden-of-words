import * as redux from "redux";
import * as model from "../model/model";

export const REVIEW = "review";
export const LEARN = "learn";
export const MEDITATE = "meditate";

export interface ReviewAction extends redux.AnyAction {
    type: typeof REVIEW;
    id: model.Id;
}

export interface MeditateAction extends redux.AnyAction {
    type: typeof MEDITATE;
    id: model.Id;
}

export interface LearnAction extends redux.AnyAction {
    type: typeof LEARN;
    item: model.Learnable;
}

export type Action = redux.AnyAction | ReviewAction | LearnAction | MeditateAction;

export function meditate(): Action {
  return { type: MEDITATE };
}

export function review(id: model.Id): Action {
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
