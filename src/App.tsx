import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import * as redux from "redux";
import "./App.css";
import * as actions from "./actions/actions";
import * as model from "./model/model";

import { hiraganaBasicDict } from "./model/kana";

// THIS IS TEMPORARY
interface Question {
    id: model.LearnableId;
    questionText: string;
    answers: string[];
}

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    onLearn: (item: model.Learnable) => redux.Action;
    onReview: (id: model.LearnableId) => redux.Action;
}

interface TestState {
    question: Question | null;
}

class TestComponent extends React.Component<TestProps, TestState> {
    _wanderClickHandler: () => void;
    _meditateClickHandler: () => void;

    constructor(props: TestProps) {
        super(props);
        this.state = { question: null };
        this._wanderClickHandler = this.wanderClickHandler.bind(this);
        this._meditateClickHandler = this.meditateClickHandler.bind(this);
    }

    wanderClickHandler() {
        const { learned, onLearn } = this.props;
        let word: model.Learnable | null = null;

        hiraganaBasicDict.keySeq().some((key: string | undefined) => {
            if (key !== undefined && !learned.has(key)) {
                word = hiraganaBasicDict.get(key);
                return true;
            }
            else {
                return false;
            }
        });

        if (word) {
            onLearn(word);
        }
        else {
            alert("Congratulations, you're fluent");
        }
    }

    meditateClickHandler() {
        const { learned, onLearn } = this.props;
        let leastRecentlyReviewed: model.LearnableId | null = null;
        let lastDate: Date | null = null;

        for (const [k, v] of Array.from(learned)) {
            console.log(k);
            console.log(v.get("lastReviewed"));
            if (lastDate == null || v.get("lastReviewed") < lastDate) {
                leastRecentlyReviewed = k;
                lastDate = v.get("lastReviewed");
            }
        }
        if (leastRecentlyReviewed !== null) {
            let reviewedWord: model.Learnable = learned.get(leastRecentlyReviewed).get("item")!;
            // build a list of 3 wrong answers and the right answer
            let options = [reviewedWord.romaji];
            let keyList = hiraganaBasicDict.keySeq().toArray();
            keyList.splice(keyList.indexOf(reviewedWord.id), 1);

            for (let i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * keyList.length);
                options.push(hiraganaBasicDict.get(keyList[index]).romaji);
                keyList.splice(index, 1);
            }

            // TODO: Make a form with all the answers in it
            /* alert(`Multiple Choice ${options}`);*/
            /* onReview(leastRecentlyReviewed);*/
            this.setState({
                question: {
                    questionText: reviewedWord.unicode,
                    answers: options,
                    id: leastRecentlyReviewed,
                },
            });
        }
    }

    render() {
        const { learned, onReview, onLearn } = this.props;

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
                        <button className="Button Review" onClick={() => onReview(id)}>
                            Review Hiragana: {item.item.romaji} = {item.item.unicode} (score {item.score})
                        </button>
                    </li>
                );
            }
        });

        if (this.state.question !== null) {
            const question = this.state.question;
            const reviewWord = (idx: number) => {
                if (idx === 0) {
                    onReview(question.id);
                }
                this.setState({ question: null });
            };
            const answers = question!.answers.map((answer, idx) => {
                return (
                    <li className="ReviewContainer" key={idx}>
                        <a className="Button Review" onClick={() => reviewWord(idx)}>
                            {answer}
                        </a>
                    </li>
                );
            });
            return (
                <div>
                    <p>Match to the word: {question!.questionText}</p>
                    <ul>
                        {answers}
                    </ul>
                </div>
            );
        }

        let meditateButton = null;

        // Don't render the meditate button if no words have been learned yet
        // TODO: we probably want to handle "earning access to a new button" in a different way
        if (learned.size > 0) {
            meditateButton =
                <button className="Button" id="Meditate" onClick={this._meditateClickHandler}>Meditate</button>;
        }

        return (
            <div>
                <a className="Button" id="Wander" onClick={this._wanderClickHandler}>Wander</a>
                {meditateButton}
                <ul>
                    {learnedItems}
                </ul>
            </div>
        );
    }
}

const Test = connect(
    (store: model.Store) => ({
        learned: store.learned,
    }),
    (dispatch: Dispatch<actions.Action>) => ({
        onLearn: (item: model.Learnable) => dispatch(actions.learn(item)),
        onReview: (id: model.LearnableId) => dispatch(actions.review(id)),
    })
)(TestComponent as React.ComponentType<TestProps>);

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
