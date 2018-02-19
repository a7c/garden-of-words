import * as immutable from "immutable";
import { HiraganaLearnable, HiraganaLearnableProps } from "./model";

const hiraganaBasicJson = require("../data/collections/hiragana-basic.json");
const hiraganaBasic = {};
hiraganaBasicJson.items.forEach((obj: HiraganaLearnableProps) => {
    obj.collection = hiraganaBasicJson.collection;
    hiraganaBasic[obj.id] = new HiraganaLearnable(obj);
});

export interface KanaDict extends immutable.Map<string, HiraganaLearnable> {}
export const hiraganaBasicDict = immutable.Map(hiraganaBasic) as KanaDict;
