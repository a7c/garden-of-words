export const REVIEW = "review";

export interface ActionBase {
    type: string;
}

export interface ReviewAction {
    type: typeof REVIEW;
}

export type Action = ReviewAction;
