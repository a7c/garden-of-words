import * as immutable from "immutable";
import { HiraganaLearnable, HiraganaLearnableProps } from "./model";
import { KatakanaLearnable, KatakanaLearnableProps } from "./model";

import * as model from "./model";
import * as actions from "../actions/actions";
import * as question from "./question";

const jsonObjects = [
    require("../data/collections/hiragana-basic.json"),
    require("../data/collections/katakana-basic.json")
];

const collectionList = {};
const dictionary = {};

jsonObjects.forEach((value) => {
    let collection: model.LearnableId[] = [];
    let collectionID = value.collection;
    value.items.forEach((obj: model.LearnableProps) => {
        obj.collection = collectionID;
        // TODO: Maybe factor out the typecasting nastiness and replace with this:
        // collection[obj.id] = new Learnable(obj);
        if (collectionID === "hira-basic") {
            dictionary[obj.id] = new HiraganaLearnable(obj as HiraganaLearnableProps);
            collection.push(obj.id);
        }
        else if (collectionID === "kata-basic") {
            dictionary[obj.id] = new KatakanaLearnable(obj as KatakanaLearnableProps);
            collection.push(obj.id);
        }
        // TODO: cases for other types
    });
    collectionList[collectionID] = collection;
});

export function getNextLearnable(store: model.Store): model.Learnable | null {
    const{ learned, flags } = store;

    let word: model.Learnable | null = null;

    if (!flags.get("hiragana-complete")) {
        let hiraNotComplete = collectionList["hira-basic"].some((value: model.LearnableId) => {
            if (value !== undefined && !learned.has(value)) {
                word = dictionary[value];
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
        let kataNotComplete = collectionList["kata-basic"].some((value: model.LearnableId) => {
            if (value !== undefined && !learned.has(value)) {
                word = dictionary[value];
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

    let keyList: model.LearnableId[] = collectionList[word.collection];

    keyList.splice(keyList.indexOf(word.id), 1);

    for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * keyList.length);
        options.push(dictionary[keyList[index]]);
        keyList.splice(index, 1);
    }
    // TODO: will need more logic for normal vocab

    // insert correct answer in a random place
    let correctIdx = Math.floor(Math.random() * (options.length + 1));
    options.splice(correctIdx, 0, word);

    return new question.MultipleChoice([word.id], options, correctIdx, correctIdx);
}

export function getLearnable(id: model.LearnableId): model.Learnable {
    return dictionary[id];
}

export function getCollection(item: model.LearnableId | model.Learnable | model.CollectionId) {
    if (typeof item === "string") {
        if (item in collectionList) {
            return collectionList[item];
        }
        else {
            return collectionList[getLearnable(item).collection];
        }
    }
    else {
        return collectionList[item.collection];
    }
}
