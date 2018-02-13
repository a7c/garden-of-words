import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./App.css";
import * as actions from "./reducers/actions";
import * as model from "./model/model";

const logo = require("./logo.svg");

interface TestProps {
    learned: immutable.Map<model.Id, model.Learned>;
    onLearn: (item: model.Learnable) => void;
    onReview: (id: model.Id) => void;
}
function TestComponent({ learned, onLearn, onReview }: TestProps) {
    let word: string | null = null;
    const wanderClickHandler = () => {
        if (word) {
            onLearn(word);
        }
    };
    const meditateClickHandler = () => {
        var leastRecentlyReviewed: number | null = null;
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
            let reviewedWord: String = learned.get(leastRecentlyReviewed).get("item")!;
            alert(`Reviewed word ${reviewedWord}`);
            onReview(leastRecentlyReviewed);
        }
    };
    const updateWord = (e: React.FormEvent<HTMLInputElement>) => {
        word = e.currentTarget.value;
    };

    const learnedItems: JSX.Element[] = [];
    learned.forEach((item, id) => {
        console.log(item, id);
        if (!item || id === undefined) {
            return;
        }
        learnedItems.push(
            <li className="ReviewContainer" key={id}>
                <a className="Button Review" onClick={() => onReview(id)}>Review: {item.item} (score {item.score})</a>
            </li>
        );
    });

    return (
        <div>
            <ul>
                {learnedItems}
            </ul>
            <input type="text" onChange={updateWord} placeholder="Enter word to learn" />
            <a className="Button" id="Wander" onClick={wanderClickHandler}>Wander</a>
            <a className="Button" id="Meditate" onClick={meditateClickHandler}>Meditate</a>
        </div>
    );
}

const Test = connect(
    (store: model.Store) => ({
      learned: store.learned
    }),
    (dispatch: Dispatch<actions.Action>) => ({

        onLearn: (item: string) => dispatch(actions.learn(item)),
        onReview: (id: model.Id) => dispatch(actions.review(id)),
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
