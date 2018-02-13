import * as immutable from "immutable";
import { HiraganaLearnable, HiraganaLearnableProps } from "./model";

const hiraganaBasicJson = require("../data/collections/hiragana-basic.json");
const hiraganaBasic = {};
hiraganaBasicJson.forEach((obj: HiraganaLearnableProps)  =>
    hiraganaBasic[obj.id] = new HiraganaLearnable(obj)
);

export const hiraganaBasicDict = immutable.Map(hiraganaBasic);
