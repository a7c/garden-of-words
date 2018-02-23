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
import CollectionComponent from "./components/Collection";
import { CollectionProps } from "./components/Collection";
import EventComponent from "./components/Event";
import QuestionComponent from "./components/Question";
import ScenePanel from "./components/ScenePanel";
import AllCollectionsComponent from "./components/AllCollections";

interface TestProps {
    store: model.Store;

    onWander: () => actions.Action;
    onLearn: (item: model.Learnable) => actions.Action;
    onReview: (id: model.LearnableId, correct: boolean) => actions.Action;
    handleEventEffect: (effect: event.Effect) => actions.Action;
}

enum MainPanelViews {
  Streets,
  Map,
  Collections
}

interface TestState {
    currentView: MainPanelViews;
    question: Question | null;
    event: event.Event | null;
    myCollections: string | null; // just set to "view" since no particular value is needed.
}

class TestComponent extends React.Component<TestProps, TestState> {
    constructor(props: TestProps) {
        super(props);
        this.state = {
          currentView: MainPanelViews.Streets,
          question: null,
          event: null,
          myCollections: null
        };
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
        const { store, onLearn, onWander, handleEventEffect } = this.props;
        let word: model.Learnable | event.Event | null = wander(store);

        onWander();

        if (word instanceof event.Event) {
            this.setState({ event: word });

            word.effects.forEach(handleEventEffect);
        }
        else if (word) {
            alert(`You learned ${word.romaji} (${word.unicode})!`);
            onLearn(word);
        }
        else {
            alert("Congratulations, you're fluent");
        }
    }

    meditateClickHandler = () => {
        const { store } = this.props;

        const question = meditate(store.learned);
        if (question) {
            this.setState({ question });
        }
    }

    streetsClickHandler = () => {
        this.setState({ currentView: MainPanelViews.Streets });
    }

    mapClickHandler = () => {
        this.setState({ currentView: MainPanelViews.Map });
    }

    collectionsClickHandler = () => {
        this.setState({ currentView: MainPanelViews.Collections });
    }

    allCollectionsClickHandler = () => {
        this.setState({ myCollections: "view" });
    }

    vendingMachineHandler = () => {
        const { store, onLearn, handleEventEffect } = this.props;

        // TODO: i think we should be dispatching an action to change the location?
        let ev: model.Learnable | event.Event | null = wander(store.set("location", "vending-machine"));

        if (ev instanceof event.Event) {
            this.setState({ event: ev });
            ev.effects.forEach(handleEventEffect);
        }
        else if (ev) {
            onLearn(ev);
        }
    }

    render() {
        const { store, onReview, onLearn } = this.props;
        const { learned, flags, collections, steps } = store;

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

        if (this.state.event !== null) {
            mainComponent =
                <EventComponent event={this.state.event} onFinished={this.onEventFinished} />;
        }
        else if (this.state.question !== null) {
            mainComponent =
                <QuestionComponent question={this.state.question} onReview={this.subOnReview} />;
        }
        // Determine what to render in the main panel
        else if (this.state.currentView === MainPanelViews.Collections) {
            mainComponent =
                <AllCollectionsComponent collections={collections} learned={learned} />;
        }
        else if (this.state.currentView === MainPanelViews.Streets) {
            let meditateButton = null;
            const leftButtons = [];
            const middleButtons = [];
            leftButtons.push(
                <button className="Button" id="Wander" key="wander-button" onClick={this.wanderClickHandler}>
                    Wander
                </button>
            );

            if (flags.get("meditate-button")) {
                leftButtons.push(
                    <button className="Button" id="Meditate" key="meditate-button" onClick={this.meditateClickHandler}>
                        Meditate
                    </button>
                );
            }

            if (flags.get("vending-machine")) {
                middleButtons.push(
                    <button
                      className="Button"
                      id="VendingMachine"
                      key="vending-machine-button"
                      onClick={this.vendingMachineHandler}
                    >
                      Vending Machine
                    </button>
                );
            }

            mainComponent = (
                <div style={{"height": "100%"}}>
                  <div id="StreetsLeft">
                    {leftButtons}
                  </div>
                  <div id="StreetsRight">
                    <div id="StreetsRightLeft">
                      {middleButtons}
                    </div>
                    <div id="StreetsRightRight"/>
                  </div>
                </div>
            );
        }

        let streetsStyle = {};
        if (this.state.currentView === MainPanelViews.Streets) {
            streetsStyle = {"background": "#BCBEC0"};
        }

        let mapStyle = {};
        if (this.state.currentView === MainPanelViews.Map) {
            mapStyle = {"background": "#BCBEC0"};
        }

        let collectionsStyle = {};
        if (this.state.currentView === MainPanelViews.Collections) {
            collectionsStyle = {"background": "#BCBEC0"};
        }

        let streetsButton = (
          <button
             id="StreetsButton"
             style={streetsStyle}
             onClick={this.streetsClickHandler}
             className="Button"
          >
              The Streets
          </button>
        );
        let mapButton = (
          <button
             id="MapButton"
             style={mapStyle}
             onClick={this.mapClickHandler}
             className="Button"
          >
              Map
          </button>
        );
        let collectionsButton = (
          <button
             id="CollectionsButton"
             style={collectionsStyle}
             onClick={this.collectionsClickHandler}
             className="Button"
          >
              Collections
          </button>
        );

        return (
          <div id="Stretcher">
            <div id="LeftPanel">
              <ScenePanel location="nowhere" steps={steps}/>
            </div>
            <div id="RightPanel">
              <div id="MenuButtonsPanel">
                <div id="Stats"/>
                {streetsButton}
                {mapButton}
                {collectionsButton}
              </div>
              <div id="MainPanel">
                {mainComponent}
              </div>
            </div>
          </div>
        );
    }
}

const Test = connect(
    (store: model.Store) => ({ store }),
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
