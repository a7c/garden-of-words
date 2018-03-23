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
import { parseEffect } from "./data/parsers";
import * as resources from "./data/constants/resources";

import EventOverlay from "./components/EventOverlay";
import Inventory from "./components/Inventory";
import Map from "./components/Map";
import NavTab from "./components/NavTab";
import ScenePanel from "./components/ScenePanel";
import Streets from "./components/Streets";
import CollectionList from "./components/AllCollections";
import QuestLog from "./components/QuestLog";

interface TestProps {
    store: model.Store;

    onLearn: (item: model.LearnableId) => actions.Action;
    onReview: (id: model.LearnableId, correct: boolean) => actions.Action;
    onWander: () => actions.Action;
    modifyResource: (resource: model.Resource, amount: number) => actions.Action;
    handleEventEffect: (effect: event.Effect) => actions.Action;
}

enum MainPanelViews {
  Streets,
  Map,
  Collections
}

interface TestState {
    happening: event.Event | model.Learnable | null;
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

    onEvent = (happening: event.Event | model.LearnableId) => {
        let showEvent = true;
        if (happening instanceof event.Event) {
            happening = happening.clone();

            const logText = happening.toEventLog();
            if (logText !== null) {
                this.setState({ eventLog: this.state.eventLog.concat([logText]) });
            }

            if (happening instanceof event.FlavorEvent || happening instanceof event.QuestEvent) {
                // Dispatch effects now
                happening.effects.forEach(this.props.handleEventEffect);
            }

            if (happening instanceof event.FlavorEvent) {
                if (happening.effects.some(p => p instanceof event.QuestEffect)) {
                    // TODO: enqueue events
                    for (const e of happening.effects) {
                        if (!(e instanceof event.QuestEffect)) {
                            continue;
                        }

                        if (model.questStage(this.props.store, e.questId) !== e.stage) {
                            happening = new event.QuestUpdatedEvent(e.questId, e.stage);
                        }
                        else {
                            showEvent = false;
                        }
                        break;
                    }
                }
                else {
                    showEvent = false;
                }
            }

            if (showEvent) {
                this.setState({ happening });
            }
        }
        else {
            showEvent = false;
            this.props.onLearn(happening);

            const logMessage = new event.LearnEffect(happening).toEventLog();
            if (logMessage !== null) {
                this.state.eventLog.push(logMessage);
            }
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
        const happening = this.state.happening;
        if (happening && happening instanceof event.QuestionEvent) {
            const logText = happening.toResultEventLog(correct);
            if (logText !== null) {
                this.state.eventLog.push(logText);
            }
        }

        this.props.onReview(id, correct);
    }

    onNavTabHint = (hint: string) => {
        this.onEvent(new event.FlavorEvent([], [], hint));
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
                        location={store.location.current}
                        steps={steps}
                    />
                </div>
                <div id="RightPanel">
                    <NavTab
                        labels={[
                            {
                                label: "The Street",
                                enabled: true,
                                hint: "",
                                onHint: this.onNavTabHint,
                            },
                            {
                                label: "Map",
                                enabled: this.props.store.location.discovered.size > 1,
                                hint: "Gotta get your bearings before looking for a map.",
                                onHint: this.onNavTabHint,
                            },
                            {
                                label: "Collections",
                                enabled: this.props.store.learned.size > 0,
                                hint: "Maybe wandering around will give you some vocabulary to collect.",
                                onHint: this.onNavTabHint,
                            },
                            {
                                label: "Quests",
                                enabled: this.props.store.quests.size > 0,
                                hint: "Maybe wandering around will give you some things to do.",
                                onHint: this.onNavTabHint,
                            }
                        ]}
                    >
                        <Streets
                            store={store}
                            onWander={this.props.onWander}
                            modifyResource={this.props.modifyResource}
                            onEvent={this.onEvent}
                            paused={this.state.happening !== null}
                            eventLog={this.state.eventLog}
                            isQuizMode={this.state.happening instanceof event.QuestionEvent}
                        />
                        <Map />
                        <CollectionList collections={collections} learned={learned} />
                        <QuestLog quests={store.quests} />
                    </NavTab>
                </div>
            </main>
        );
    }
}

const Test = connect(
    (store: model.Store) => ({ store }),
    (dispatch: Dispatch<actions.Action>) => ({
        onLearn: (item: model.LearnableId) => dispatch(actions.learn(item)),
        onReview: (id: model.LearnableId, correct: boolean) =>
            dispatch(actions.review(id, correct)),
        onWander: () => {
            dispatch(actions.wander());
        },
        modifyResource: (resource: model.Resource, amount: number) => {
            dispatch(actions.modifyResource(resource, amount));
        },
        handleEventEffect: (effect: event.Effect) => dispatch(effect.toAction())
    })
)(TestComponent as React.ComponentType<TestProps>);

export default class App extends React.Component {

    render() {
        return (
            <div className="App">
            <h1>Michael Mauer Simulator 2017</h1>
            <Test/>
        </div>
        );
    }
}
