import * as immutable from "immutable";

export type Id = number;
export type Learnable = string;
export type Location = string;
export enum Resource {
}

declare module "immutable" {
    interface Map<K, V> {
        [Symbol.iterator](): IterableIterator<[K, V ]>;
    }
}

export type Collection = immutable.List<Id>;

export const LearnedRecord = immutable.Record({
    item: null,
    lastReviewed: new Date(), // TODO: set a more sane date
    score: 0.0,
});

// Even bigger hack to get it to work with TypeScript
// https://gist.github.com/HeyImAlex/099922105b83bacfb69a30989e1fa086
export interface LearnedProps {
    readonly item: Learnable | null;
    readonly lastReviewed: Date;
    readonly score: number;
}

export interface Learned extends LearnedProps {
    new (props?: LearnedProps): Learned;

    get<K extends keyof LearnedProps>(key: K): Learned[K];
    set<K extends keyof LearnedProps>(key: K, value: Learned[K]): Learned;
}

export const Learned = immutable.Record({
    item: null,
    lastReviewed: new Date(),
    score: 0.0,
}) as any as Learned; // tslint:disable-line

export interface StoreProps {
    readonly learned: immutable.Map<Id, Learned>;
    readonly collections: immutable.List<Collection>;
    readonly resources: immutable.Map<Resource, number>;
    readonly location: Location;
}

export interface Store extends StoreProps {
    new (props?: StoreProps): Store;

    set<K extends keyof StoreProps>(key: K, value: Store[K]): Store;
}

export const Store = immutable.Record({
    learned: immutable.Map(),
    collections: immutable.List(),
    resources: immutable.Map(),
    location: "nowhere",
}) as any as Store; // tslint:disable-line
