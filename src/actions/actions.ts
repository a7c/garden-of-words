import * as redux from "redux";
import * as model from "../model/model";

export const REVIEW = "review";
export const LEARN = "learn";
export const MEDITATE = "meditate";
export const UPDATE_FLAG = "update_flag";
export const UPDATE_QUEST = "update_quest";
export const WANDER = "wander";
export const DISCOVER = "discover";
export const TRAVEL = "travel";
export const MODIFY_RESOURCE = "modify_resource";
export const MODIFY_RESOURCE_MAX = "modify_resource_max";
export const THEME = "theme";
export const HATIFY = "hat";

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
    item: model.LearnableId;
}

export interface UpdateFlagAction extends redux.AnyAction {
    type: typeof UPDATE_FLAG;
    flag: model.Flag;
    value: model.FlagValue;
}

export interface DiscoverAction extends redux.AnyAction {
    type: typeof DISCOVER;
    location: model.Location;
}

export interface TravelAction extends redux.AnyAction {
    type: typeof TRAVEL;
    location: model.Location;
}

export interface WanderAction extends redux.AnyAction {
    type: typeof WANDER;
}

export interface ModifyResourceAction extends redux.AnyAction {
    type: typeof MODIFY_RESOURCE;
    resource: model.Resource;
    newValue?: number;
    newMaxValue?: number;
}

export interface UpdateQuestAction extends redux.AnyAction {
    type: typeof UPDATE_QUEST;
    quest: model.QuestId;
    stage: model.QuestStage;
}

export interface ThemeAction extends redux.AnyAction {
    type: typeof THEME;
    theme: string;
}

export interface HatifyAction extends redux.AnyAction {
    type: typeof HATIFY;
    hat: string | null;
}

export type Action =
    | redux.AnyAction | ReviewAction | LearnAction | MeditateAction
    | UpdateFlagAction | WanderAction | ModifyResourceAction | ThemeAction
    | HatifyAction;

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

export function learn(item: model.LearnableId): Action {
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

/** Adds `value` to the max amount of the given resource. */
export function modifyResourceMax(resource: model.Resource, value: number): Action {
    return {
        type: MODIFY_RESOURCE_MAX,
        resource,
        value: value
    };
}

/** Adds `value` to the amount of the given resource. */
export function modifyResource(resource: model.Resource, value: number): Action {
    return {
        type: MODIFY_RESOURCE,
        resource,
        value: value
    };
}

export function discover(location: model.Location): Action {
    return {
        type: DISCOVER,
        location: location,
    };
}

export function travel(location: model.Location): Action {
    return {
        type: TRAVEL,
        location: location,
    };
}

export function updateQuest(quest: model.QuestId, stage: model.QuestStage): Action {
    return {
        type: UPDATE_QUEST,
        quest,
        stage,
    };
}

export function theme(name: string): Action {
    return {
        type: THEME,
        theme: name,
    };
}

export function hatify(hat: string | null): Action {
    return {
        type: HATIFY,
        hat,
    };
}
