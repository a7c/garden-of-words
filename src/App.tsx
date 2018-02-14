import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./Common.css";
import "./App.css";
import * as actions from "./actions/actions";
import * as model from "./model/model";
import * as question from "./model/question";

import { QuestionComponent } from "./Question";

import { hiraganaBasicDict } from "./model/kana";

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    onLearn: (item: model.Learnable) => void;
    onReview: (id: model.LearnableId) => void;
}

interface TestState {
    question: question.Question | null;
}

class TestComponent extends React.Component<TestProps, TestState> {
    _wanderClickHandler: () => void;
    _meditateClickHandler: () => void;
    subOnReview: (id: model.LearnableId, correct: boolean) => void;

    constructor(props: TestProps) {
        super(props);
        this.state = { question: null };
        this._wanderClickHandler = this.wanderClickHandler.bind(this);
        this._meditateClickHandler = this.meditateClickHandler.bind(this);
        this.subOnReview = (id: model.LearnableId, correct: boolean) => {
            this.props.onReview(id);
            this.setState({ question: null });
        };
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
            let options: model.Learnable[] = [];
            let keyList = hiraganaBasicDict.keySeq().toArray();
            keyList.splice(keyList.indexOf(reviewedWord.id), 1);

            for (let i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * keyList.length);
                options.push(hiraganaBasicDict.get(keyList[index]));
                keyList.splice(index, 1);
            }

            // insert correct answer in a random place
            let correctIdx = Math.floor(Math.random() * (options.length + 1));
            options.splice(correctIdx, 0, reviewedWord);

            this.setState({
                question: new question.MultipleChoice([reviewedWord.id], options, correctIdx, correctIdx),
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

            const displayedScore = item.score.toFixed(1);

            // if (item.item.type === "katakana") {
            //     learnedItems.push(
            //         <li className="ReviewContainer" key={id}>
            //         <button className="Button Review" onClick={() => onReview(id)}>
            //         Review Katakana: {item.item.romaji} = {item.item.unicode} (score {displayedScore})
            //         </button>
            //         </li>
            //     );
            // }
            // else if (item.item.type === "hiragana") {
            learnedItems.push(
                <li className="ReviewContainer" key={id}>
                    <a className=" Review" onClick={() => onReview(id)}>
                        {item.item.back()} = {item.item.front()} (score {displayedScore})
                    </a>
                </li>
            );
            // }
        });

        if (this.state.question !== null) {
            return (
                <QuestionComponent question={this.state.question} onReview={this.subOnReview} />
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

const Test = (connect as any)( //tslint:disable-line
    (store: model.Store) => ({
        learned: store.learned,
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
