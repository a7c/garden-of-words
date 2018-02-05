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

export const StoreRecord = immutable.Record({
    learned: immutable.Map(),
    collections: immutable.List(),
    resources: immutable.Map(),
    location: "nowhere",
});

export class Store extends StoreRecord {
    public readonly learned: immutable.Map<Id, Learned>;
    public readonly collections: immutable.List<Collection>;
    public readonly resources: immutable.Map<Resource, number>;
    public readonly location: Location;
}
