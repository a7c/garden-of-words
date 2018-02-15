import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./Common.css";
import "./App.css";
import * as actions from "./actions/actions";
import { Event } from "./model/event";
import * as model from "./model/model";
import { Question } from "./model/question";
import meditate from "./meditate";
import wander from "./wander";

import EventComponent from "./components/Event";
import QuestionComponent from "./components/Question";

import { hiraganaBasicDict } from "./model/kana";

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    onLearn: (item: model.Learnable) => void;
    onReview: (id: model.LearnableId) => void;
}

interface TestState {
    question: Question | null;
    event: Event | null;
}

class TestComponent extends React.Component<TestProps, TestState> {
    _wanderClickHandler: () => void;
    _meditateClickHandler: () => void;
    subOnReview: (id: model.LearnableId, correct: boolean) => void;

    constructor(props: TestProps) {
        super(props);
        this.state = { question: null, event: null };
        this._wanderClickHandler = this.wanderClickHandler.bind(this);
        this._meditateClickHandler = this.meditateClickHandler.bind(this);
        this.subOnReview = (id: model.LearnableId, correct: boolean) => {
            this.props.onReview(id);
            this.setState({ question: null });
        };
    }

    wanderClickHandler() {
        const { learned, onLearn } = this.props;
        let word: model.Learnable | Event | null = wander(learned);

        if (word instanceof Event) {
            this.setState({ event: word });
        }
        else if (word) {
            onLearn(word);
        }
        else {
            alert("Congratulations, you're fluent");
        }
    }

    meditateClickHandler() {
        const { learned } = this.props;

        const question = meditate(learned);
        if (question) {
            this.setState({ question });
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

        if (this.state.event !== null) {
            return (
                <EventComponent event={this.state.event} />
            );
        }
        else if (this.state.question !== null) {
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
