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
import Wardrobe from "./components/Wardrobe";

let CHEAT_CODES_ENABLED = true;

interface TestProps {
    store: model.Store;

    onLearn: (item: model.LearnableId) => actions.Action;
    onReview: (id: model.LearnableId, correct: boolean) => actions.Action;
    onWander: () => actions.Action;
    modifyResource: (resource: model.Resource, amount: number) => actions.Action;
    handleEventEffect: (effect: event.Effect, store: model.Store) => actions.Action;
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

            if (happening instanceof event.MultiEvent) {
                queuedEvents = queuedEvents.concat(happening.getEvents());
            }

            if (happening instanceof event.FlavorEvent || happening instanceof event.QuestEvent) {
                // Dispatch effects now
                happening.effects.forEach((effect) => this.props.handleEventEffect(effect, this.props.store));
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

            // Process log text after processing event
            const logText = happening.toEventLog();
            if (logText !== null) {
                this.setState({ eventLog: this.state.eventLog.concat([logText]) });
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

    _cheatReplenish = (yen: number, stamina: number) => {
        this.props.modifyResource("yen", yen);
        this.props.modifyResource("stamina", stamina);
    }

    _cheatSwole = (maxStamina: number) => {
        this.props.handleEventEffect(new event.ResourceMaxEffect("stamina", maxStamina), this.props.store);
        this.props.modifyResource("stamina", maxStamina);
    }

    _cheat2000IQ = () => {
        const collections = lookup.getCollections();
        for (const collectionName of Object.keys(collections)) {
            const collection = collections[collectionName];
            for (const learnableId of collection.learnables) {
                this.props.onLearn(learnableId);
            }
        }
    }

    _cheatSudo = () => {
        const effects = [
            // need to learn some kana and vocab so that unlocked things don't crash
            new event.LearnEffect("hira-い"),
            new event.LearnEffect("hira-と"),
            new event.LearnEffect("hira-な"),
            new event.LearnEffect("hira-み"),
            new event.LearnEffect("vocab-紫"),
            new event.LearnEffect("vocab-紫-kana-meaning"),
            new event.LearnEffect("vocab-紫-kana-meaning-reverse"),
            new event.LearnEffect("vocab-紫-kana-romaji-0"),
            new event.FlagEffect("has-transliteration-job", true),
            new event.FlagEffect("has-luggage-job", true),
            new event.FlagEffect("ordered-blue-ramen", true),
            new event.FlagEffect("ordered-red-ramen", true),
            new event.FlagEffect("ordered-purple-ramen", true),
            new event.DiscoverEffect("airport-food-court"),
            new event.DiscoverEffect("airport-food-court-ramen"),
            new event.DiscoverEffect("airport-gate-vending-machine"),
            new event.DiscoverEffect("airport-train-station"),
            new event.DiscoverEffect("airport-train-station-ticket-booth"),
            new event.QuestEffect("rehydrate", "complete"),
            new event.QuestEffect("ramen-ya", "complete"),
            new event.QuestEffect("airport-train-station", "target-located"),
        ];
        effects.map((eff) => this.props.handleEventEffect(eff, this.props.store));
    }

    onKey = (e: KeyboardEvent) => {
        if (!CHEAT_CODES_ENABLED) {
            return;
        }
        switch (e.code) {
            case "F1": {
                this._cheatReplenish(1000, 100);
                this.setState({ eventLog: this.state.eventLog.concat([
                    "It's not every day that money appears in your pocket and your tiredness goes away."
                ]) });
                e.preventDefault();
                break;
            }
            case "F2": {
                this._cheatSwole(20);
                this.setState({ eventLog: this.state.eventLog.concat([
                    "You magically feel more durable."
                ]) });
                e.preventDefault();
                break;
            }
            case "F3": {
                this._cheat2000IQ();
                this.setState({ eventLog: this.state.eventLog.concat([
                    "You learned everything we have to teach about Japanese."
                ]) });
                e.preventDefault();
                break;
            }
            case "F4": {
                this._cheatSudo();
                this.setState({ eventLog: this.state.eventLog.concat([
                    "You become one with everything."
                ]) });
                e.preventDefault();
                break;
            }
            case "F10": {
                this._cheatReplenish(10000, 100);
                this._cheatSwole(100);
                this._cheat2000IQ();
                this._cheatSudo();
                this.setState({ eventLog: this.state.eventLog.concat([
                    "You ascend to your ultimate form. You become Ultra-Gaijin."
                ]) });
                e.preventDefault();
                break;
            }
            // disable cheat codes
            case "F12": {
                CHEAT_CODES_ENABLED = false;
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

        const labels = [
            {
                label: locationData.area || "The Street",
                url: "Area",
                enabled: true,
                hint: "",
                onHint: this.onNavTabHint,
            },
            /* {
             *     label: "Map",
             *     url: "Map",
             *     enabled: this.props.store.location.discovered.size > 1,
             *     hint: "Gotta get your bearings before looking for a map.",
             *     onHint: this.onNavTabHint,
             * },*/
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
        ];

        if (store.wardrobe.themes.size > 1 || store.wardrobe.hats.size > 0) {
            labels.push({
                label: "Wardrobe",
                url: "Wardrobe",
                enabled: true,
                hint: "",
                onHint: this.onNavTabHint,
            });
        }

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
                        store={this.props.store}
                        steps={steps}
                    />
                </div>
                <div id="RightPanel">
                    <NavTab
                        labels={labels}
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
                        <CollectionList collections={collections} learned={learned} />
                        <QuestLog store={store} />
                        <Wardrobe store={store} dispatch={this.props.handleEventEffect} />
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
        onReview: (id: model.LearnableId, correct: boolean) => {
            dispatch(actions.review(id, correct));
        },
        onWander: () => {
            dispatch(actions.wander());
        },
        modifyResource: (resource: model.Resource, amount: number) => {
            dispatch(actions.modifyResource(resource, amount));
        },
        handleEventEffect: (effect: event.Effect, store: model.Store) => {
            if (effect instanceof event.LearnNextEffect) {
                effect.init(store);
            }
            dispatch(effect.toAction());
        },
    })
)(TestComponent as React.ComponentType<TestProps>);

export default class App extends React.Component {

    render() {
        return (
            <div className="App">
                <h1>I Sudoku'd And Was Reborn in Japan, But I'm a
                Ninja Stuck in Narita Airport And I Don't Speak Any
                Japanese</h1>
                <h1>切腹をしたら、成田空港から脱出できない忍者として転生したが、日本語が全く喋れない‼︎</h1>
                <Test/>
                <a target="_blank" href="credits.html">Credits</a>
            </div>
        );
    }
}
