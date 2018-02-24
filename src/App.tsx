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
import EventComponent from "./components/Event";
import QuestionComponent from "./components/Question";
import ScenePanel from "./components/ScenePanel";
import Streets from "./components/Streets";
import CollectionList from "./components/AllCollections";
import { StatsComponent, StatsProps } from "./components/StatsComponent";

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
        console.log(happening);
        if (happening instanceof Question) {
        }
        else if (happening instanceof event.Event) {
            happening.effects.forEach(this.props.handleEventEffect);
            this.state.eventLog.push(happening.toEventLog());
        }
        else {
            this.props.onLearn(happening);
            this.state.eventLog.push(`You learned ${happening.front()} means ${happening.back()}.`);
        }
        this.setState({ happening });
    }

    onNotHappening = () => {
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
                        happening={this.state.happening}
                        onReviewFinished={this.onReviewFinished}
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
          <Test/>
      </div>
    );
  }
}

export default App;
