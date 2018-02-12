import * as redux from "redux";
import * as model from "../model/model";

export const REVIEW = "review";
export const LEARN = "learn";

export interface ReviewAction extends redux.AnyAction {
    type: typeof REVIEW;
    id: model.LearnableId;
}

export interface LearnAction extends redux.AnyAction {
    type: typeof LEARN;
    item: model.Learnable;
}

export type Action = redux.AnyAction | ReviewAction | LearnAction;

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
