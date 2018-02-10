import * as immutable from "immutable";

interface ImmutableRecord<T> {
    new (props?: T): this;

    get<K extends keyof this>(key: K): this[K];
    set<K extends keyof this>(key: K, value: this[K]): this;
    toJS(): T;
}

export type LearnableId = string;

export interface LearnableProps {
    id: LearnableId;
    subId?: LearnableId;
}

export interface HiraganaLearnableProps extends LearnableProps {
    type: "hiragana";
    unicode: string;
    romaji: string;
}
export interface HiraganaLearnable extends HiraganaLearnableProps, ImmutableRecord<HiraganaLearnableProps> {}
export const HiraganaLearnable = immutable.Record({
    type: "hiragana",
    id: "",
    subId: null,
    unicode: "",
    romaji: "",
}) as any as HiraganaLearnable; // tslint:disable-line

export interface KatakanaLearnableProps extends LearnableProps {
    type: "katakana";
    unicode: string;
    romaji: string;
}
export interface KatakanaLearnable extends KatakanaLearnableProps, ImmutableRecord<KatakanaLearnableProps> {}
export const KatakanaLearnable = immutable.Record({
    type: "katakana",
    id: "",
    subId: null,
    unicode: "",
    romaji: "",
}) as any as KatakanaLearnable; // tslint:disable-line

export type Learnable = HiraganaLearnable | KatakanaLearnable;

export type Location = string;
export enum Resource {
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
}

export interface Store extends StoreProps, ImmutableRecord<StoreProps> {
}

export const Store = immutable.Record({
    learned: immutable.Map(),
    collections: immutable.List(),
    resources: immutable.Map(),
    location: "nowhere",
}) as any as Store; // tslint:disable-line
