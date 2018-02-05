import * as immutable from "immutable";

export type Id = number;
export type Learnable = string;
export type Location = string;
export enum Resource {
}

export type Collection = immutable.List<Id>;

export const LearnedRecord = immutable.Record({
    item: null,
    lastReviewed: new Date(), // TODO: set a more sane date
    score: 0.0,
});
export class Learned extends LearnedRecord {
    // Hack to get it to work with TypeScript
    // Note: StrictPropertyChecking must be false in tsconfig
    public readonly item: Learnable | null;
    public readonly lastReviewed: Date;
    public readonly score: number;
}

// Even bigger hack to get it to work with TypeScript
// https://gist.github.com/HeyImAlex/099922105b83bacfb69a30989e1fa086
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
