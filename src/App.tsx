import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./Common.css";
import * as redux from "redux";
import "./App.css";
import * as actions from "./actions/actions";
import * as event from "./model/event";
import * as model from "./model/model";
import * as lookup from "./model/lookup";
import { Question, QuestionTemplate, MultipleChoiceQuestionTemplate } from "./model/question";
import { parseEffect } from "./data/parsers";
import * as resources from "./model/resources";
import * as locations from "./data/locations";

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
    eventQueue: event.Event[];
    eventLog: string[];
    questNotification: boolean;
}

class TestComponent extends React.Component<TestProps, TestState> {
    constructor(props: TestProps) {
        super(props);
        this.state = {
            happening: null,
            eventQueue: [],
            eventLog: [],
            questNotification: false,
        };
    }

    enqueueQuestUpdates(effects: event.Effect[]) {
        const newEvents = [];
        for (const e of effects) {
            if (!(e instanceof event.QuestEffect)) {
                continue;
            }

            if (model.questStage(this.props.store, e.questId) !== e.stage) {
                newEvents.push(new event.QuestUpdatedEvent(e.questId, e.stage));
            }
        }

        if (newEvents.length > 0) {
            this.setState({
                questNotification: true,
            });
        }
        return newEvents;
    }

    onEvent = (happening: event.Event | model.LearnableId) => {
        let queuedEvents: event.Event[] = [];

        console.log(JSON.stringify(happening));

        if (happening instanceof event.Event) {
            const showEvent = happening.showEvent;
            happening = happening.clone();

            const logText = happening.toEventLog();
            if (logText !== null) {
                this.setState({ eventLog: this.state.eventLog.concat([logText]) });
            }

            if (happening instanceof event.MultiEvent) {
                queuedEvents = queuedEvents.concat(happening.getEvents());
            }

            if (happening instanceof event.FlavorEvent || happening instanceof event.QuestEvent) {
                // Dispatch effects now
                happening.effects.forEach(this.props.handleEventEffect);
            }

            if (happening instanceof event.FlavorEvent) {
                queuedEvents = this.enqueueQuestUpdates(happening.effects);
            }
            else if (happening instanceof event.QuestEvent) {
                this.setState({ questNotification: true });
            }

            if (happening instanceof event.QuestionEvent) {
                if (happening.sequence !== null && happening.sequence > 0) {

                    for (let i = 0; i < happening.sequence; i++) {
                        const newQ = happening.clone();
                        // Preserve sequence number so that we can use
                        // it as a key to a React component; this lets
                        // us force remounting so that separate questions
                        // don't appear to share state
                        newQ.sequence = i;
                        queuedEvents.push(newQ);
                    }
                }
            }

            if (showEvent) {
                this.setState({ happening });
            }
            else if (queuedEvents.length > 0) {
                // Make sure that the next queuedEvent is valid based on the filters
                while (queuedEvents.length > 0) {
                    const nextHappening = queuedEvents[0];
                    if (nextHappening.check(this.props.store) || nextHappening.filters.length === 0) {
                        this.setState({
                            happening: nextHappening,
                            eventQueue: queuedEvents.slice(1),
                        });
                        break;
                    }
                    else {
                        queuedEvents = queuedEvents.slice(1);
                    }
                }
                if (queuedEvents.length === 0) {
                    this.setState({ happening: null });
                }
            }
        }
        else {
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

        if (this.state.eventQueue.length > 0) {
            let queuedEvents = this.state.eventQueue;
            // Make sure that the next queuedEvent is valid based on the filters
            while (queuedEvents.length > 0) {
                const nextHappening = queuedEvents[0];
                if (nextHappening.check(this.props.store) || nextHappening.filters.length === 0) {
                    this.setState({
                        happening: nextHappening,
                        eventQueue: queuedEvents.slice(1),
                    });
                    break;
                }
                else {
                    queuedEvents = queuedEvents.slice(1);
                }
            }
            if (queuedEvents.length === 0) {
                this.setState({ happening: null });
            }
        }
        else {
            this.setState({ happening: null });
        }
    }

    onReviewFinished = (id: model.LearnableId, correct: boolean) => {
        const happening = this.state.happening;
        if (happening && happening instanceof event.QuestionEvent) {
            const logText = happening.toResultEventLog(correct);
            if (logText !== null) {
                this.state.eventLog.push(logText);
            }

            this.setState({
                eventQueue: this.state.eventQueue.concat(this.enqueueQuestUpdates(
                    correct ? happening.effects : happening.failureEffects)),
            });
        }

        this.props.onReview(id, correct);
    }

    onNavTabHint = (hint: string) => {
        this.onEvent(new event.FlavorEvent([], [], hint));
    }

    onKey = (e: KeyboardEvent) => {
        switch (e.code) {
            case "F1": {
                this.props.modifyResource("yen", 1000);
                this.props.modifyResource("stamina", 100);
                e.preventDefault();
                this.setState({ eventLog: this.state.eventLog.concat([
                    "It's not every day that money appears in your pocket and your tiredness goes away."
                ]) });
                break;
            }
            case "F2": {
                this.props.handleEventEffect(new event.ResourceMaxEffect("stamina", 25));
                this.setState({ eventLog: this.state.eventLog.concat([
                    "You magically feel more durable."
                ]) });
                e.preventDefault();
                break;
            }
            case "F3": {
                const collections = lookup.getCollections();
                for (const collectionName of Object.keys(collections)) {
                    const collection = collections[collectionName];
                    for (const learnableId of collection.learnables) {
                        this.props.onLearn(learnableId);
                    }
                }
                this.setState({ eventLog: this.state.eventLog.concat([
                    "You learned everything we have to teach about Japanese."
                ]) });
                e.preventDefault();
                break;
            }
            default: {
                break;
            }
        }
    }

    componentWillMount() {
        document.addEventListener("keydown", this.onKey);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKey);
    }

    render() {
        const { store, onReview, onLearn } = this.props;
        const { learned, flags, collections, steps, location } = store;

        const locationData = locations.getLocation(location.current);
        const allowNavigation = !this.state.happening ||
                                (this.state.happening instanceof event.Event ?
                                 this.state.happening.allowNavigation : true);

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
                                label: locationData.area || "The Street",
                                url: "Area",
                                enabled: true,
                                hint: "",
                                onHint: this.onNavTabHint,
                            },
                            {
                                label: "Map",
                                url: "Map",
                                enabled: this.props.store.location.discovered.size > 1,
                                hint: "Gotta get your bearings before looking for a map.",
                                onHint: this.onNavTabHint,
                            },
                            {
                                label: "Collections",
                                url: "Collections",
                                enabled: allowNavigation &&
                                         this.props.store.learned.size > 0,
                                hint: allowNavigation ?
                                      "Maybe wandering around will give you some vocabulary to collect."
                                      : "Can't view collections while answering a question.",
                                onHint: this.onNavTabHint,
                            },
                            {
                                label: "Quests",
                                url: "Quests",
                                enabled: this.props.store.quests.size > 0,
                                hint: "Maybe wandering around will give you some things to do.",
                                onHint: this.onNavTabHint,
                                alert: this.state.questNotification,
                                clearAlert: () => this.setState({ questNotification: false }),
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
                        <QuestLog store={store} />
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
                <h1>I Sudoku'd And Was Reborn in Japan, But I'm a
                Ninja Stuck in Narita Airport And I Don't Speak Any
                Japanese</h1>
                <h1>自殺したら、成田空港から脱出できない忍者として転生したが、日本語が全く喋れない‼︎</h1>
                <Test/>
                <a href="credits.html">Credits</a>
            </div>
        );
    }
}
