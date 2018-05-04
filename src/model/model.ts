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

export interface Learnable {
    type: string;
    id: LearnableId;
    parentId: LearnableId | null;
    collection: string;
    front: string;
    back: string;
}

export type Location = string;
export type Resource = string;

declare module "immutable" {
    interface Map<K, V> {
        [Symbol.iterator](): IterableIterator<[K, V ]>;
    }
}

export type CollectionId = string;
export type Collection = immutable.Set<LearnableId>;

export const LearnedRecord = immutable.Record({
    item: null,
    lastReviewed: new Date(), // TODO: set a more sane date
    score: 0.0,
});

// Even bigger hack to get it to work with TypeScript
// https://gist.github.com/HeyImAlex/099922105b83bacfb69a30989e1fa086
export interface LearnedProps {
    readonly item: LearnableId;
    readonly lastReviewed: Date;
    readonly score: number;
}

export interface Learned extends LearnedProps, ImmutableRecord<LearnedProps> {
}

export interface ResourceProps {
    readonly currentValue: number;
    readonly maxValue: number | null;
}

export const defaultResourceProps: ResourceProps = {
    currentValue: 0,
    maxValue: null
};

export const Learned = immutable.Record({
    item: null,
    lastReviewed: new Date(),
    score: 0.0,
}) as any as Learned; // tslint:disable-line

export interface LocationProps {
    readonly current: Location;
    readonly discovered: immutable.Set<Location>;
}

export interface LocationRecord extends LocationProps, ImmutableRecord<LocationProps> {
}

export const LocationRecord = immutable.Record({
    current: "airport-gate",
    discovered: immutable.Set(["airport-gate"]),
}) as any as LocationRecord; // tslint:disable-line

export interface WardrobeProps {
    readonly themes: immutable.Set<string>;
    readonly currentTheme: string;
    readonly hats: immutable.Set<string>;
    readonly currentHat: string | null;
}

export interface WardrobeRecord extends WardrobeProps, ImmutableRecord<WardrobeProps> {
}

export const WardrobeRecord = immutable.Record({
    currentTheme: "theme-gray",
    themes: immutable.Set(["theme-gray"]),
    currentHat: null,
    hats: immutable.Set([]),
}) as any as WardrobeRecord; // tslint:disable-line

export interface StoreProps {
    readonly learned: immutable.Map<LearnableId, Learned>;
    readonly collections: immutable.Map<CollectionId, Collection>;
    readonly resources: immutable.Map<Resource, ResourceProps>;
    readonly location: LocationRecord;
    readonly flags: immutable.Map<Flag, FlagValue>;
    readonly quests: immutable.Map<QuestId, QuestStage>;
    readonly wardrobe: WardrobeRecord;
    readonly steps: number;
}

export interface Store extends StoreProps, ImmutableRecord<StoreProps> {
}

export const Store = immutable.Record({
    learned: immutable.Map(),
    collections: immutable.Map(),
    resources: immutable.Map(),
    location: new LocationRecord(),
    flags: immutable.Map(),
    quests: immutable.Map(),
    wardrobe: new WardrobeRecord(),
    steps: 0,
}) as any as Store; // tslint:disable-line

export function locationDiscovered(store: Store, location: Location): boolean {
    return store.location.discovered.includes(location);
}

export function questStarted(store: Store, quest: QuestId): boolean {
    return store.quests.has(quest);
}

export function questStage(store: Store, quest: QuestId): QuestStage | null {
    return store.quests.has(quest) ? store.quests.get(quest) : null;
}
