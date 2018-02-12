import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./App.css";
import * as actions from "./actions/actions";
import * as model from "./model/model";

const logo = require("./logo.svg");

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    onLearn: (item: model.Learnable) => void;
    onReview: (id: model.LearnableId) => void;
}
function TestComponent({ learned, onLearn, onReview }: TestProps) {
    let word: model.Learnable | null = null;
    const clickHandler = () => {
        if (word) {
            onLearn(word);
        }
    };
    const updateWord = (e: React.FormEvent<HTMLInputElement>) => {
        if (Math.random() < 0.5) {
            word = new model.KatakanaLearnable({
                type: "katakana",
                id: e.currentTarget.value,
                unicode: "ツ",
                romaji: e.currentTarget.value,
            });
        } else {
            word = new model.HiraganaLearnable({
                type: "hiragana",
                id: e.currentTarget.value,
                unicode: "つ",
                romaji: e.currentTarget.value,
            });
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
                <li key={id}>
                    <button onClick={() => onReview(id)}>
                        Review Katakana: {item.item.romaji} = {item.item.unicode} (score {item.score})
                    </button>
                </li>
            );
        }
        else if (item.item.type === "hiragana") {
            learnedItems.push(
                <li key={id}>
                    <button onClick={() => onReview(id)}>
                        Review Hiragana: {item.item.romaji} = {item.item.unicode} (score {item.score})
                    </button>
                </li>
            );
        }
    });

    return (
        <div>
            <ul>
                {learnedItems}
            </ul>
            <input type="text" onChange={updateWord} placeholder="Enter word to learn" />
            <button onClick={clickHandler}>WANDER</button>
        </div>
    );
}

const Test = connect(
    (store: model.Store) => ({ learned: store.learned }),
    (dispatch: Dispatch<actions.Action>) => ({
        onLearn: (item: model.Learnable) => dispatch(actions.learn(item)),
        onReview: (id: model.LearnableId) => dispatch(actions.review(id)),
    })
)(TestComponent);

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Test/>
      </div>
    );
  }
}

export default App;
