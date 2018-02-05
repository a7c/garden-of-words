import * as model from "../model/model";

export const REVIEW = "review";
export const LEARN = "learn";

export interface ActionBase {
    type: string;
}

export interface ReviewAction {
    type: typeof REVIEW;
}

export interface LearnAction {
    type: typeof LEARN;
    item: model.Learnable;
}

export type Action = ReviewAction | LearnAction;

export function learn(item: model.Learnable): Action {
    return {
        type: LEARN,
        item
    };
}
