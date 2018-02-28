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

import EventOverlay from "./components/EventOverlay";
import Inventory from "./components/Inventory";
import Map from "./components/Map";
import NavTab from "./components/NavTab";
import ScenePanel from "./components/ScenePanel";
import Streets from "./components/Streets";
import CollectionList from "./components/AllCollections";

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
    happening: Question | event.Event | model.Learnable | null;
    eventLog: string[];
}

class TestComponent extends React.Component<TestProps, TestState> {
    constructor(props: TestProps) {
        super(props);
        this.state = {
            happening: null,
            eventLog: [],
        };
    }

    onEvent = (happening: Question | event.Event | model.Learnable) => {
        let showEvent = true;
        if (happening instanceof Question) {
        }
        else if (happening instanceof event.Event) {
            const logText = happening.toEventLog();
            if (logText !== null) {
                this.state.eventLog.push(logText);
            }

            if (happening instanceof event.FlavorEvent) {
                // Dispatch effects now since we aren't showing the effect
                happening.effects.forEach(this.props.handleEventEffect);
                showEvent = false;
            }
        }
        else {
            showEvent = false;
            this.props.onLearn(happening);
            this.state.eventLog.push(`You learned ${happening.front()} means ${happening.back()}.`);
        }

        if (showEvent) {
            this.setState({ happening });
        }
    }

    onNotHappening = () => {
        const happening = this.state.happening;
        if (happening && happening instanceof event.Event) {
            const logText = happening.toPostEventLog();
            if (logText !== null) {
                this.state.eventLog.push(logText);
            }
        }

        this.setState({ happening: null });
    }

    onReviewFinished = (id: model.LearnableId, correct: boolean) => {
        this.props.onReview(id, correct);
    }

    render() {
        const { store, onReview, onLearn } = this.props;
        const { learned, flags, collections, steps } = store;

        return (
            <main>
                <div id="LeftPanel">
                    <Inventory resources={store.resources} />
                    <EventOverlay
                        store={this.props.store}
                        happening={this.state.happening}
                        onReviewFinished={this.onReviewFinished}
                        handleEventEffect={this.props.handleEventEffect}
                        onNotHappening={this.onNotHappening}
                    />
                    <ScenePanel
                        location={store.location}
                        steps={steps}
                    />
                </div>
                <div id="RightPanel">
                    <NavTab labels={["The Street", "Map", "Collections"]}>
                        <Streets
                            store={store}
                            onWander={this.props.onWander}
                            onEvent={this.onEvent}
                            paused={this.state.happening !== null}
                            eventLog={this.state.eventLog}
                        />
                        <Map />
                        <CollectionList collections={collections} learned={learned} />
                    </NavTab>
                </div>
            </main>
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
          <h1>Michael Mauer Simulator 2017</h1>
          <Test/>
      </div>
    );
  }
}

export default App;
