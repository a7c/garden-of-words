import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./App.css";
import * as actions from "./actions/actions";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";

const logo = require("./logo.svg");

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    onLearn: (item: model.Learnable) => void;
    onReview: (id: model.LearnableId) => void;
}
function TestComponent({ learned, onLearn, onReview }: TestProps) {
    let word: model.Learnable | null = null;
    const wanderClickHandler = () => {

        word = null;

        hiraganaBasicDict.keySeq().some((key: string | undefined) => {
                if (key !== undefined && !learned.has(key)) {
                    word = hiraganaBasicDict.get(key);
                    return true;
                } else {
                    return false;
                }
            }
        );

        if (word) {
            onLearn(word);
        } else {
            alert("Congratulations, you're fluent");
        }
    };
    const meditateClickHandler = () => {
        var leastRecentlyReviewed: model.LearnableId | null = null;
        var lastDate: Date | null = null;
        for (const [k, v] of Array.from(learned)) {
            console.log(k);
            console.log(v.get("lastReviewed"));
            if (lastDate == null || v.get("lastReviewed") < lastDate) {
                leastRecentlyReviewed = k;
                lastDate = v.get("lastReviewed");
            }
        }
        if (leastRecentlyReviewed != null) {
            let reviewedWord: model.Learnable = learned.get(leastRecentlyReviewed).get("item")!;
            // build a list of 3 wrong answers and the right answer
            let options = [reviewedWord.romaji];
            let keyList = hiraganaBasicDict.keySeq().toArray();
            keyList.splice(keyList.indexOf(reviewedWord.id), 1);

            for (var i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * (keyList.length + 1));
                options.push(hiraganaBasicDict.get(keyList[index]).romaji);
                keyList.splice(index, 1);
            }

            // TODO: Make a form with all the answers in it
            alert(`Multiple Choice ${options}`);
            onReview(leastRecentlyReviewed);
        }
    };

    const learnedItems: JSX.Element[] = [];
    learned.forEach((item, id) => {
        console.log(item, id);
        if (!item || id === undefined || !item.item) {
            return;
        }
        console.log(item.item.toJS());
        if (item.item.type === "katakana") {
            learnedItems.push(
                <li className="ReviewContainer" key={id}>
                    <a className="Button Review" onClick={() => onReview(id)}>
                        Review Katakana: {item.item.romaji} = {item.item.unicode} (score {item.score})
                    </a>
                </li>
            );
        }
        else if (item.item.type === "hiragana") {
            learnedItems.push(
                <li className="ReviewContainer" key={id}>
                    <a className="Button Review" onClick={() => onReview(id)}>
                        Review Hiragana: {item.item.romaji} = {item.item.unicode} (score {item.score})
                    </a>
                </li>
            );
        }
    });

    return (
        <div>
            <a className="Button" id="Wander" onClick={wanderClickHandler}>Wander</a>
            <a className="Button" id="Meditate" onClick={meditateClickHandler}>Meditate</a>
            <ul>
                {learnedItems}
            </ul>
        </div>
    );
}

const Test = connect(
    (store: model.Store) => ({
      learned: store.learned
    }),
    (dispatch: Dispatch<actions.Action>) => ({
        onLearn: (item: model.Learnable) => dispatch(actions.learn(item)),
        onReview: (id: model.LearnableId) => dispatch(actions.review(id)),
    })
)(TestComponent);

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Test/>
      </div>
    );
  }
}

export default App;
