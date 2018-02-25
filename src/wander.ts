import * as immutable from "immutable";

import * as event from "./model/event";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";
import { katakanaBasicDict } from "./model/kana";
import events from "./data/events";
import * as actions from "./actions/actions";

export default function wander(store: model.Store):
model.Learnable | event.Event | null {
    const { location, learned } = store;
    // TODO: full location-based event system
    if (location === "vending-machine") {
        for (const ev of events.vendingMachine) {
            if (!ev.check(store)) {
                continue;
            }

            return ev;
        }
    }

    if (events.events.length > 0) {
        return events.events.shift();
    }

    // let word: model.Learnable | null = null;
    // return word;

    return chooseNewWord(store);
}

function chooseNewWord(store: model.Store): model.Learnable | null {
    console.log("choosing word");
    const { learned, flags } = store;

    let word: model.Learnable | null = null;

    if (!flags.get("hiragana-complete")) {
        let hiraNotComplete = hiraganaBasicDict.keySeq().some((key: string | undefined) => {
            if (key !== undefined && !learned.has(key)) {
                word = hiraganaBasicDict.get(key);
                return true;
            }
            else {
                return false;
            }
        });
        if (!hiraNotComplete) {
            actions.updateFlag("hiragana-complete", true);
        }
    }
    else if (!flags.get("katakana-complete")) {
        let kataNotComplete = katakanaBasicDict.keySeq().some((key: string | undefined) => {
            if (key !== undefined && !learned.has(key)) {
                word = katakanaBasicDict.get(key);
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

    console.log("WORD: " + word);

    return word;
}
