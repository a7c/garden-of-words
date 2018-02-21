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
import ScenePanel from "./components/ScenePanel";
import AllCollectionsComponent from "./components/AllCollections";

interface TestProps {
    learned: immutable.Map<model.LearnableId, model.Learned>;
    flags: immutable.Map<model.Flag, model.FlagValue>;
    collections: immutable.Map<model.CollectionId, model.Collection>;
    steps: number;

    onWander: () => actions.Action;
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
        const { learned, onLearn, onWander, handleEventEffect } = this.props;

        onWander();

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

    allCollectionsClickHandler = () => {
        const{ learned, collections } = this.props;

        this.setState({ myCollections: "view" });
        
        collections.keySeq().toArray().forEach(console.log);

    }

    render() {
        const { learned, collections, flags, steps, onReview, onLearn } = this.props;

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

        let mainComponent = null;

        // Determine what to render in the main panel
        if (this.state.event !== null) {
            mainComponent =
                <EventComponent event={this.state.event} onFinished={this.onEventFinished} />;
        }
        else if (this.state.question !== null) {
            mainComponent =
                <QuestionComponent question={this.state.question} onReview={this.subOnReview} />;
        }
        else if (this.state.myCollections !== null) {
            mainComponent =
                <AllCollectionsComponent collections={collections} onFinished={this.onAllCollectionsDone}/>;
        }
        else {
            let meditateButton = null;
            if (flags.get("meditate-button")) {
                meditateButton =
                    <button className="Button" id="Meditate" onClick={this.meditateClickHandler}>Meditate</button>;
            }

            let allCollectionsButton = null;
            if (flags.get("collections-unlocked")) {
                allCollectionsButton = 
                    (
                        <button className="Button" id="AllCollections" onClick={this.allCollectionsClickHandler}>
                            Collections
                        </button>
                    );       
            }
            
            mainComponent = (
                <div>
                    <button className="Button" id="Wander" onClick={this.wanderClickHandler}>Wander</button>
                    {meditateButton}
                    {allCollectionsButton}
                    <ul>
                        {learnedItems}
                    </ul>
                </div>
            );
        }

        return (
            <div>
                <ScenePanel location="nowhere" steps={steps} />
                <div id="main-panel">
                    {mainComponent}
                </div>
            </div>
        );
    }
}

const Test = connect(
    (store: model.Store) => ({
        learned: store.learned,
        flags: store.flags,
        collections: store.collections,
        steps: store.steps
    }),
    (dispatch: Dispatch<actions.Action>) => ({
        onLearn: (item: model.Learnable) => dispatch(actions.learn(item)),
        onReview: (id: model.LearnableId, correct: boolean) => 
            dispatch(actions.review(id, correct)),
        onWander: () => dispatch(actions.wander()),
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
