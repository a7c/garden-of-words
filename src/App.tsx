import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./Common.css";
import * as redux from "redux";
import "./App.css";
import * as actions from "./actions/actions";
import * as event from "./model/event";
import * as model from "./model/model";
import { Question } from "./model/question";
import meditate from "./meditate";
import wander from "./wander";

import EventComponent from "./components/Event";
import QuestionComponent from "./components/Question";
import ArtPanel from "./components/ArtPanel";

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    flags: immutable.Map<model.Flag, model.FlagValue>;
    onLearn: (item: model.Learnable) => actions.Action;
    onReview: (id: model.LearnableId, correct: boolean) => actions.Action;
    handleEventEffect: (effect: event.Effect) => actions.Action;
}

interface TestState {
    question: Question | null;
    event: event.Event | null;
}

class TestComponent extends React.Component<TestProps, TestState> {
    constructor(props: TestProps) {
        super(props);
        this.state = { question: null, event: null };
    }

    subOnReview = (id: model.LearnableId, correct: boolean) => {
        this.props.onReview(id, correct);
        this.setState({ question: null });
    }

    onEventFinished = () => {
        this.setState({ event: null });
    }

    wanderClickHandler = () => {
        const { learned, onLearn, handleEventEffect } = this.props;
        let word: model.Learnable | event.Event | null = wander(learned);

        if (word instanceof event.Event) {
            this.setState({ event: word });

            word.effects.forEach(handleEventEffect);
        }
        else if (word) {
            onLearn(word);
        }
        else {
            alert("Congratulations, you're fluent");
        }
    }

    meditateClickHandler = () => {
        const { learned } = this.props;

        const question = meditate(learned);
        if (question) {
            this.setState({ question });
        }
    }

    render() {
        const { learned, flags, onReview, onLearn } = this.props;

        const learnedItems: JSX.Element[] = [];
        learned.forEach((item, id) => {
            if (!item || id === undefined || !item.item) {
                return;
            }

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
                    <a className=" Review">
                        {item.item.back()} = {item.item.front()} (score {displayedScore})
                    </a>
                </li>
            );
            // }
        });

        if (this.state.event !== null) {
            return (
                <EventComponent event={this.state.event} onFinished={this.onEventFinished} />
            );
        }
        else if (this.state.question !== null) {
            return (
                <QuestionComponent question={this.state.question} onReview={this.subOnReview} />
            );
        }

        let meditateButton = null;

        if (flags.get("meditate-button")) {
            meditateButton =
                <button className="Button" id="Meditate" onClick={this.meditateClickHandler}>Meditate</button>;
        }

        return (
            <div>
                <ArtPanel location="nowhere" />
                <div id="main-panel">
                    <button className="Button" id="Wander" onClick={this.wanderClickHandler}>Wander</button>
                    {meditateButton}
                    <ul>
                        {learnedItems}
                    </ul>
                </div>
            </div>
        );
    }
}

const Test = connect(
    (store: model.Store) => ({
        learned: store.learned,
        flags: store.flags
    }),
    (dispatch: Dispatch<actions.Action>) => ({
        onLearn: (item: model.Learnable) => dispatch(actions.learn(item)),
        onReview: (id: model.LearnableId, correct: boolean) => 
            dispatch(actions.review(id, correct)),
        handleEventEffect: (effect: event.Effect) => dispatch(effect.toAction())
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
