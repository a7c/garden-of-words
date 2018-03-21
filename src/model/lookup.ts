import * as immutable from "immutable";

import * as model from "./model";
import * as actions from "../actions/actions";
import * as quest from "./quest";
import * as question from "./question";
import * as vocab from "./vocab";
import * as parsers from "../data/parsers";

export interface Collection {
    name: string;
    subtitle?: string;
    learnables: model.LearnableId[];
}

const collectionList: { [key: string]: Collection } = {};
const dictionary = {};

function loadCollection(json: any) { //tslint:disable-line
    collectionList[json.collection] = {
        name: json.name,
        subtitle: json.subtitle,
        learnables: json.items.map((obj: model.Learnable) => {
            obj.collection = json.collection;
            dictionary[obj.id] = obj;
            return obj.id;
        }),
    };
}

function loadVocab(json: any) { //tslint:disable-line
    const learnables: model.LearnableId[] = [];
    json.items.forEach((vocabEntry: vocab.VocabEntry) => {
        vocabEntry.collection = vocabEntry.collection || json.collection;

        for (const learnable of vocab.makeLearnables(vocabEntry)) {
            dictionary[learnable.id] = learnable;
            learnables.push(learnable.id);
        }
    });
    collectionList[json.collection] = {
        name: json.name,
        subtitle: json.subtitle,
        learnables,
    };
}

loadCollection(require("../data/collections/hiragana-basic.json"));
loadCollection(require("../data/collections/katakana-basic.json"));
loadVocab(require("../data/collections/vocab-basic.json"));

export function getNextLearnable(store: model.Store): model.LearnableId | null {
    const{ learned, flags } = store;

    let word: model.LearnableId | null = null;

    if (!flags.get("hiragana-complete")) {
        for (const id of collectionList["hira-basic"].learnables) {
            if (!learned.has(id)) {
                word = id;
                break;
            }
        }
    }
    else if (!flags.get("katakana-complete")) {
        for (const id of collectionList["kata-basic"].learnables) {
            if (!learned.has(id)) {
                word = id;
                break;
            }
        }
    }
    // TODO: Decision making for actual vocab words

    return word;
}

export function generateMultipleChoice(_word: model.Learnable | model.LearnableId) {
    const word = typeof _word === "string" ? getLearnable(_word) : _word as model.Learnable;

    // build a list of 3 wrong answers and the right answer
    const options: model.Learnable[] = [];

    const keyList: model.LearnableId[] =
        collectionList[word.collection].learnables
        .slice()
        .filter(learnableId => {
            // Only consider options that are of the same learnable
            // type, and which are reversed/not reversed as
            // appropriate
            const learnable = getLearnable(learnableId);
            return word.type === learnable.type &&
                word.id.endsWith("-reverse") === learnable.id.endsWith("-reverse");
        });

    keyList.splice(keyList.indexOf(word.id), 1);

    // Don't take more options than are available
    for (let i = 0; i < Math.min(3, keyList.length); i++) {
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

export function generateTypeIn(word: model.Learnable) {
    return new question.TypeIn([ word.id ], word);
}

export function generateQuestion(word: model.Learnable) {
    if (Math.random() < 0.5 && word.back.match(/^[a-zA-Z]+$/)) {
        return generateTypeIn(word);
    }
    return generateMultipleChoice(word);
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

export function getCollections(): { [key: string]: Collection } {
    return collectionList;
}

const quests = new Map();
(require("../data/quests.json") as parsers.QuestProps[])
    .map(parsers.parseQuest)
    .forEach(q => quests.set(q.id, q));

export function getQuest(id: model.QuestId): quest.Quest {
    return quests.get(id);
}
