import * as immutable from "immutable";
import * as wanakana from "wanakana";

import * as model from "./model";

export interface VocabEntry {
    id: string;
    collection: string;
    /** Ways to write the word (even if it doesn't contain kanji) */
    kanji: string[];
    /** How to pronounce the word (in kana) */
    readings: string[];
    meanings: string[];
}

export function makeLearnables(entry: VocabEntry): model.Learnable[] {
    const result: model.Learnable[] = [
        {
            type: "vocab-parent",
            id: `${entry.id}`,
            collection: "",
            front: entry.readings[0],
            back: entry.meanings[0],
            parentId: null,
        },
        {
            type: "vocab-kana-meaning",
            id: `${entry.id}-kana-meaning`,
            collection: entry.collection,
            front: entry.readings[0],
            back: entry.meanings[0],
            parentId: entry.id,
        },
        {
            type: "vocab-kana-meaning-reverse",
            id: `${entry.id}-kana-meaning-reverse`,
            collection: entry.collection,
            front: entry.meanings[0],
            back: entry.readings[0],
            parentId: entry.id,
        },
    ];

    for (let i = 0; i < entry.readings.length; i++) {
        const learnable = {
            type: "vocab-kana-romaji",
            id: `${entry.id}-kana-romaji-${i}`,
            collection: entry.collection,  // TODO: which to put in collection?
            front: entry.readings[i],
            back: wanakana.toRomaji(entry.readings[i]),
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
