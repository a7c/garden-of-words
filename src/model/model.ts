import * as immutable from "immutable";

interface ImmutableRecord<T> {
    new (props?: T): this;

    get<K extends keyof this>(key: K): this[K];
    set<K extends keyof this>(key: K, value: this[K]): this;
    toJS(): T;

    front(): string;
    back(): string;
}

export type LearnableId = string;
export type QuestId = string;
export type QuestStage = string;
export type Flag = string;
export type FlagValue = boolean;

export interface LearnableProps {
    id: LearnableId;
    subId: LearnableId | null;
}

function learnableRecord<P, T>(defaults: P, front: string, back: string): T {
    const result = immutable.Record(defaults) as any as T; // tslint:disable-line
    (result as any).prototype.front = function() { // tslint:disable-line
        return this.get(front);
    };
    (result as any).prototype.back = function() { // tslint:disable-line
        return this.get(back);
    };
    return result;
}

export interface HiraganaLearnableProps extends LearnableProps {
    type: "hiragana";
    unicode: string;
    romaji: string;
}
export interface HiraganaLearnable extends HiraganaLearnableProps, ImmutableRecord<HiraganaLearnableProps> {}
export const HiraganaLearnable = learnableRecord<HiraganaLearnableProps, HiraganaLearnable>(
    {
        type: "hiragana",
        id: "",
        subId: null,
        unicode: "",
        romaji: "",
    },
    "unicode",
    "romaji"
);

export interface KatakanaLearnableProps extends LearnableProps {
    type: "katakana";
    unicode: string;
    romaji: string;
}
export interface KatakanaLearnable extends KatakanaLearnableProps, ImmutableRecord<KatakanaLearnableProps> {}
export const KatakanaLearnable = learnableRecord<KatakanaLearnableProps, KatakanaLearnable>(
    {
        type: "katakana",
        id: "",
        subId: null,
        unicode: "",
        romaji: "",
    },
    "unicode",
    "romaji"
);

export type Learnable = HiraganaLearnable | KatakanaLearnable;

export type Location = string;
export enum Resource {
}

declare module "immutable" {
    interface Map<K, V> {
        [Symbol.iterator](): IterableIterator<[K, V ]>;
    }
}

export type Collection = immutable.List<LearnableId>;

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

export interface Learned extends LearnedProps, ImmutableRecord<LearnedProps> {
}

export const Learned = immutable.Record({
    item: null,
    lastReviewed: new Date(),
    score: 0.0,
}) as any as Learned; // tslint:disable-line

export interface StoreProps {
    readonly learned: immutable.Map<LearnableId, Learned>;
    readonly collections: immutable.List<Collection>;
    readonly resources: immutable.Map<Resource, number>;
    readonly location: Location;
    readonly flags: immutable.Map<Flag, FlagValue>;
}

export interface Store extends StoreProps, ImmutableRecord<StoreProps> {
}

export const Store = immutable.Record({
    learned: immutable.Map(),
    collections: immutable.List(),
    resources: immutable.Map(),
    location: "nowhere",
    flags: immutable.Map(),
}) as any as Store; // tslint:disable-line
