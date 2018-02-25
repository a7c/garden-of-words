import * as immutable from "immutable";
import { HiraganaLearnable, HiraganaLearnableProps } from "./model";
import { KatakanaLearnable, KatakanaLearnableProps } from "./model";

const hiraganaBasicJson = require("../data/collections/hiragana-basic.json");
const hiraganaBasic = {};
hiraganaBasicJson.items.forEach((obj: HiraganaLearnableProps) => {
    obj.collection = hiraganaBasicJson.collection;
    hiraganaBasic[obj.id] = new HiraganaLearnable(obj);
});

const katakanaBasicJson = require("../data/collections/katakana-basic.json");
const katakanaBasic = {};
katakanaBasicJson.items.forEach((obj: KatakanaLearnableProps) => {
    obj.collection = katakanaBasicJson.collection;
    katakanaBasic[obj.id] = new KatakanaLearnable(obj);
});

export interface KanaDict extends immutable.Map<string, HiraganaLearnable> {}
export const hiraganaBasicDict = immutable.Map(hiraganaBasic) as KanaDict;
export const katakanaBasicDict = immutable.Map(katakanaBasic) as KanaDict;
