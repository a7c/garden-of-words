import * as immutable from "immutable";
import { HiraganaLearnable, HiraganaLearnableProps } from "./model";
import { KatakanaLearnable, KatakanaLearnableProps } from "./model";

import * as model from "./model";
// import { katakanaBasicDict, hiraganaBasicDict } from "./kana";
import * as actions from "../actions/actions";
import * as question from "./question";

const jsonObjects = [
    require("../data/collections/hiragana-basic.json"),
    require("../data/collections/katakana-basic.json")
];

export const allCollections = {};
const idToLearnable = {};

jsonObjects.forEach((value) => {
    // let collectionJson = require(`${value}`);
    let collection: model.LearnableId[] = [];
    let collectionID = value.collection;
    value.items.forEach((obj: model.LearnableProps) => {
        obj.collection = collectionID;
        // TODO: Maybe factor out the typecasting nastiness and replace with this:
        // collection[obj.id] = new Learnable(obj);
        if (collectionID === "hira-basic") {
            idToLearnable[obj.id] = new HiraganaLearnable(obj as HiraganaLearnableProps);
            collection.push(obj.id);
        }
        else if (collectionID === "kata-basic") {
            idToLearnable[obj.id] = new KatakanaLearnable(obj as KatakanaLearnableProps);
            collection.push(obj.id);
        }
        // TODO: cases for other types
    });
    allCollections[collectionID] = collection;
});

const collectionList = immutable.Map(allCollections) as immutable.Map<model.CollectionId, model.Collection>;
const dictionary = immutable.Map(idToLearnable) as immutable.Map<model.LearnableId, model.Learnable>;

export function getNextLearnable(store: model.Store): model.Learnable | null {
    const{ learned, flags } = store;

    let word: model.Learnable | null = null;

    if (!flags.get("hiragana-complete")) {
        let hiraNotComplete = collectionList.get("hira-basic").some((value, key) => {
            if (value !== undefined && !learned.has(value)) {
                word = dictionary.get(value);
                return true;
            }
            else {
                return false;
            }
        });
        // TODO: This method of flag setting doesn't work. May have to update reducer
        if (!hiraNotComplete) {
            actions.updateFlag("hiragana-complete", true);
        }
    }
    else if (!flags.get("katakana-complete")) {
        let kataNotComplete = collectionList.get("kata-basic").some((value, key) => {
            if (value !== undefined && !learned.has(value)) {
                word = dictionary.get(value);
                return true;
            }
            else {
                return false;
            }
        });
        if (!kataNotComplete) {
            actions.updateFlag("katakana-complete", true);
        }
    }
    // TODO: Decision making for actual vocab words

    return word;
}

export function generateMultipleChoice(word: model.Learnable) {
    // build a list of 3 wrong answers and the right answer
    let options: model.Learnable[] = [];

    // hack because for some reason it wouldn't let me convert straight to array
    let collection = collectionList.get(word.collection);
    let keyList: model.LearnableId[] = [];
    collection.forEach((value) => {
        if (value !== undefined ) {
            keyList.push(value);
        }
    });

    keyList.splice(keyList.indexOf(word.id), 1);

    for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * keyList.length);
        options.push(dictionary.get(keyList[index]));
        keyList.splice(index, 1);
    }
    // TODO: will need more logic for normal vocab

    // insert correct answer in a random place
    let correctIdx = Math.floor(Math.random() * (options.length + 1));
    options.splice(correctIdx, 0, word);

    return new question.MultipleChoice([word.id], options, correctIdx, correctIdx);
}

export function getLearnable(id: model.LearnableId): model.Learnable {
    return dictionary.get(id);
}

export function getCollection(item: model.LearnableId | model.Learnable | model.CollectionId) {
    if (typeof item === "string") {
        if (collectionList.has(item)) {
            return collectionList.get(item);
        }
        else {
            return collectionList.get(getLearnable(item).collection);
        }
    }
    else {
        return collectionList.get(item.collection);
    }
}
