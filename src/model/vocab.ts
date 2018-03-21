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
    const result: model.Learnable[] = [
        {
            type: "vocab",
            id: entry.id,
            collection: "",
            front: entry.readings[0],
            back: entry.meanings[0],
            parentId: null,
        },
    ];

    for (let i = 0; i < entry.readings.length; i++) {
        const learnable = {
            type: "vocab-kana-romaji",
            id: `${entry.id}-kana-romaji-${i}`,
            collection: entry.collection,  // TODO: which to put in collection?
            front: entry.readings[i],
            back: entry.romaji[i],
            parentId: entry.id,
        };
        result.push(learnable);
        result.push({
            ...learnable,
            front: learnable.back,
            back: learnable.front,
            id: `${learnable.id}-reverse`,
        });
    }

    return result;
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
