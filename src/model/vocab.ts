import * as immutable from "immutable";
// TODO: make type declarations for this library
// import * as wanakana from "wanakana";

import * as model from "./model";

// TODO: code duplication-ish
interface ImmutableRecord<T> {
    new (props?: T): this;

    get<K extends keyof this>(key: K): this[K];
    set<K extends keyof this>(key: K, value: this[K]): this;
    toJS(): T;
}

export interface VocabEntryProps {
    id: model.LearnableId;
    collection: model.CollectionId;
    /** Ways to write the word (even if it doesn't contain kanji) */
    kanji: string[];
    /** How to pronounce the word (in kana) */
    readings: string[];
    meanings: string[];
    /** TODO: remove this once wanakana works */
    romaji: string[];
}

function toVocabRecord<P, T>(defaults: P): T {
    const result = immutable.Record(defaults) as any as T; // tslint:disable-line
    return result;
}

interface VocabEntryRecord extends VocabEntryProps, ImmutableRecord<VocabEntryProps> {}
const VocabEntryRecord = toVocabRecord<VocabEntryProps, VocabEntryRecord>(
    {
        id: "",
        collection: "",
        kanji: [],
        readings: [],
        meanings: [],
        romaji: []
    }
);
export interface VocabEntry extends VocabEntryRecord {
    /** Converts the reading at [index] to romaji and returns the result. */
    toRomaji: (index?: number) => string;

    toKanaRomajiLearnable: () => model.Learnable;
}
export class VocabEntry extends VocabEntryRecord {
    constructor(props: VocabEntryProps) {
        super(props);
    }

    toRomaji = (index: number = 0) => {
        return this.romaji[index];
        // return wanakana.toRomaji(this.readings[index]) as string;
    }

    toKanaRomajiLearnable = () => {
        return {
            type: "vocab-kana-romaji",
            id: this.id,
            subId: "kana-romaji",
            collection: this.collection,
            front: this.readings[0],
            back: this.toRomaji()
        } as model.Learnable;
    }
}

const vocabBasicProps = [
    {
        "id": "vocab-赤い",
        "collection": "vocab-basic",
        "kanji": ["赤い"],
        "readings": ["あかい"],
        "meanings": ["red"],
        "romaji": ["akai"]
    },
    {
        "id": "vocab-青い",
        "collection": "vocab-basic",
        "kanji": ["青い"],
        "readings": ["あおい"],
        "meanings": ["blue"],
        "romaji": ["aoi"]
    }
];

const vocab = {};
for (let p of vocabBasicProps) {
    vocab[p.id] = new VocabEntry(p);
}
export interface VocabDict extends immutable.Map<string, VocabEntry> {}
export const vocabDict = immutable.Map(vocab) as VocabDict;
