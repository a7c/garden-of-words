import * as immutable from "immutable";

import * as model from "./model";
import * as actions from "../actions/actions";
import * as quest from "./quest";
import * as question from "./question";
import * as vocab from "./vocab";
import * as parsers from "../data/parsers";

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

collectionList["vocab-basic"] = [];
for (const vocabEntry of vocab.vocabBasicProps) {
    for (const learnable of vocab.makeLearnables(vocabEntry)) {
        dictionary[learnable.id] = learnable;
        collectionList["vocab-basic"].push(learnable.id);
    }
}

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
    const options: model.Learnable[] = [];

    const keyList: model.LearnableId[] = collectionList[word.collection];

    keyList.splice(keyList.indexOf(word.id), 1);

    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * keyList.length);
        options.push(dictionary[keyList[index]]);
        keyList.splice(index, 1);
    }
    // TODO: will need more logic for normal vocab

    // insert correct answer in a random place
    const correctIdx = Math.floor(Math.random() * (options.length + 1));
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

export function getCollections(): { [key: string]: model.Learnable[] } {
    return collectionList;
}

const quests = new Map();
(require("../data/quests.json") as parsers.QuestProps[])
    .map(parsers.parseQuest)
    .forEach(q => quests.set(q.id, q));

export function getQuest(id: model.QuestId): quest.Quest {
    return quests.get(id);
}
