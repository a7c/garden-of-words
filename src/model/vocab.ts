import * as immutable from "immutable";
// TODO: make type declarations for this library
// import * as wanakana from "wanakana";

import * as model from "./model";

export interface VocabEntry {
    id: string;
    collection: string;
    /** Ways to write the word (even if it doesn't contain kanji) */
    kanji: string[];
    /** How to pronounce the word (in kana) */
    readings: string[];
    meanings: string[];
    /** TODO: remove this once wanakana works */
    romaji: string[];
}

export function makeLearnables(entry: VocabEntry): model.Learnable[] {
    return [];
}

// export class VocabEntry extends VocabEntryRecord {
//     constructor(props: VocabEntryProps) {
//         super(props);
//     }

//     toRomaji = (index: number = 0) => {
//         return this.romaji[index];
//         // return wanakana.toRomaji(this.readings[index]) as string;
//     }

//     toKanaRomajiLearnable = () => {
//         return {
//             type: "vocab-kana-romaji",
//             id: this.id,
//             subId: "kana-romaji",
//             collection: this.collection,
//             front: this.readings[0],
//             back: this.toRomaji()
//         } as model.Learnable;
//     }
// }

// TODO: move to JSON
const vocabBasicProps: VocabEntry[] = [
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
