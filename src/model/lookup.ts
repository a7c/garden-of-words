import * as immutable from "immutable";

import * as model from "./model";
import * as actions from "../actions/actions";
import * as quest from "./quest";
import * as question from "./question";
import * as vocab from "./vocab";
import * as parsers from "../data/parsers";
import * as npc from "./npc";

export interface Collection {
    name: string;
    subtitle?: string;
    description: string[];
    learnables: model.LearnableId[];
}

const collectionList: { [key: string]: Collection } = {};
const dictionary = {};

function loadCollection(json: any) { //tslint:disable-line
    collectionList[json.collection] = {
        name: json.name,
        subtitle: json.subtitle,
        description: json.description || [],
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
        description: json.description || [],
        subtitle: json.subtitle,
        learnables,
    };
}

loadCollection(require("../data/collections/hiragana-basic.json"));
loadCollection(require("../data/collections/katakana-basic.json"));
loadVocab(require("../data/collections/vocab-basic-colors.json"));
loadVocab(require("../data/collections/vocab-basic-numbers.json"));

const maleNameList: npc.Name[] = [];
const femaleNameList: npc.Name[] = [];

function loadNames(json: any, gender: npc.Gender) { //tslint:disable-line
    json.forEach((nameEntry: npc.Name) => {
        switch (gender) {
        case npc.Gender.Male:
            maleNameList.push(nameEntry);
            break;
        case npc.Gender.Female:
            femaleNameList.push(nameEntry);
            break;
        default:
            throw "Unrecognized gender enum";
        }
    });
}

loadNames(require("../data/collections/names-male.json"), npc.Gender.Male);
loadNames(require("../data/collections/names-female.json"), npc.Gender.Female);

export function getNames(gender: npc.Gender) {
    switch (gender) {
    case npc.Gender.Male:
        return maleNameList;
    case npc.Gender.Female:
        return femaleNameList;
    default:
        throw "Unrecognized gender enum";
    }
}

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

export function generateMultipleChoice(
        _word: model.Learnable | model.LearnableId) {
    console.log(_word);
    const word = typeof _word === "string" ? getLearnable(_word) : _word as model.Learnable;

    // build a list of 3 wrong answers and the right answer
    const options: model.Learnable[] = [];

    console.log(word);

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

    console.log(keyList);

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

    return new question.MultipleChoice([word.id], options, correctIdx, correctIdx, false);
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
let __parsedQuests = false;//tslint:disable-line

export function getQuest(id: model.QuestId): quest.Quest {
    // Lazy-load to avoid circular imports (ugh)
    if (!__parsedQuests) {
        (require("../data/quests.json") as parsers.QuestProps[])
            .map(parsers.parseQuest)
            .forEach(q => quests.set(q.id, q));
        __parsedQuests = true;
    }
    return quests.get(id);
}

export function getLeastRecentlyReviewed(
    learned: immutable.Map<model.LearnableId, model.Learned>,
    filter?: (learnable: model.Learnable) => boolean
):
    model.Learnable | null {
    let leastRecentlyReviewed: model.LearnableId | null = null;
    let lastDate: Date | null = null;

    learned.forEach((v, k) => {
        if (!v || !k) {
            return;
        }

        if (filter && !filter(getLearnable(k))) {
            return;
        }

        if (lastDate == null || v.get("lastReviewed") < lastDate) {
            leastRecentlyReviewed = k;
            lastDate = v.get("lastReviewed");
        }
    });

    if (leastRecentlyReviewed !== null) {
        return getLearnable(learned.get(leastRecentlyReviewed).get("item"));
    }
    return null;
}
