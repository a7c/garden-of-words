import * as immutable from "immutable";

import * as model from "./model";
import * as actions from "../actions/actions";
import * as question from "./question";

const jsonObjects = [
    require("../data/collections/hiragana-basic.json"),
    require("../data/collections/katakana-basic.json"),
];

const collectionList = {};
const dictionary = {};

jsonObjects.forEach((value) => {
    const collection: model.LearnableId[] = [];
    const collectionID = value.collection;
    value.items.forEach((obj: model.Learnable) => {
        obj.collection = collectionID;
        dictionary[obj.id] = obj;
        collection.push(obj.id);
    });
    collectionList[collectionID] = collection;
});

export function getNextLearnable(store: model.Store): model.LearnableId | null {
    const{ learned, flags } = store;

    let word: model.LearnableId | null = null;

    if (!flags.get("hiragana-complete")) {
        for (const id of collectionList["hira-basic"]) {
            if (!learned.has(id)) {
                word = id;
                break;
            }
        }
    }
    else if (!flags.get("katakana-complete")) {
        for (const id of collectionList["kata-basic"]) {
            if (!learned.has(id)) {
                word = id;
                break;
            }
        }
    }
    // TODO: Decision making for actual vocab words

    return word;
}

export function generateMultipleChoice(word: model.Learnable | model.LearnableId) {
    if (typeof word === "string") {
        word = getLearnable(word);
    }

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
