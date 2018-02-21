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
import AllCollectionsComponent from "./components/AllCollections";

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    flags: immutable.Map<model.Flag, model.FlagValue>;
    collections: immutable.Map<model.CollectionId, model.Collection>;
    location: model.Location;
    resources: immutable.Map<model.Resource, number>;
    onLearn: (item: model.Learnable) => actions.Action;
    onReview: (id: model.LearnableId, correct: boolean) => actions.Action;
    handleEventEffect: (effect: event.Effect) => actions.Action;
}

interface TestState {
    question: Question | null;
    event: event.Event | null;
    myCollections: string | null; // just set to "view" since no particular value is needed.
}

class TestComponent extends React.Component<TestProps, TestState> {
    constructor(props: TestProps) {
        super(props);
        this.state = { question: null, event: null, myCollections: null };
    }

    subOnReview = (id: model.LearnableId, correct: boolean) => {
        this.props.onReview(id, correct);
        this.setState({ question: null });
    }

    onEventFinished = () => {
        this.setState({ event: null });
    }

    onAllCollectionsDone = () => {
        this.setState({ myCollections: null });
    }

    wanderClickHandler = () => {
        const { learned, location, resources, onLearn, handleEventEffect } = this.props;
        let word: model.Learnable | event.Event | null = wander(location, resources, learned);

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

    allCollectionsClickHandler = () => {
        const{ learned, collections } = this.props;

        this.setState({ myCollections: "view" });

        collections.keySeq().toArray().forEach(console.log);

    }

    vendingMachineHandler = () => {
        const { learned, resources, onLearn, handleEventEffect } = this.props;
        let ev: model.Learnable | event.Event | null = wander("vending-machine", resources, learned);

        if (ev instanceof event.Event) {
            this.setState({ event: ev });
            ev.effects.forEach(handleEventEffect);
        }
        else if (ev) {
            onLearn(ev);
        }
    }

    render() {
        const { learned, collections, flags, onReview, onLearn } = this.props;

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
        else if (this.state.myCollections !== null) {
            return (
                <AllCollectionsComponent collections={collections} onFinished={this.onAllCollectionsDone}/>
            );
        }

        const buttons = [];

        if (flags.get("meditate-button")) {
            buttons.push(
                <button className="Button" id="Meditate" onClick={this.meditateClickHandler}>Meditate</button>
            );
        }

        if (flags.get("collections-unlocked")) {
            buttons.push(
                <button className="Button" id="AllCollections" onClick={this.allCollectionsClickHandler}>
                    Collections
                </button>
            );
        }

        if (flags.get("vending-machine")) {
            buttons.push(
                <button className="Button" onClick={this.vendingMachineHandler}>Vending Machine</button>
            );
        }

        return (
            <div>
                <button className="Button" id="Wander" onClick={this.wanderClickHandler}>Wander</button>
                {buttons}
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
        flags: store.flags,
        collections: store.collections,
        location: store.location,
        resources: store.resources,
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
