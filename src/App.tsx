import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./Common.css";
import * as redux from "redux";
import "./App.css";
import * as actions from "./actions/actions";
import * as event from "./model/event";
import * as model from "./model/model";
import * as quests from "./model/quest";
import * as lookup from "./model/lookup";
import { Question, QuestionTemplate, MultipleChoiceQuestionTemplate } from "./model/question";
import { parseEffect } from "./data/parsers";
import * as resources from "./model/resources";
import * as locations from "./data/locations";

import EventOverlay from "./components/EventOverlay";
import Inventory from "./components/Inventory";
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
    clearAlert: (name: string) => void;
    modifyResource: (resource: model.Resource, amount: number) => actions.Action;
    handleEventEffect: (effect: event.Effect, store: model.Store) => actions.Action;
}

interface TestState {
    happening: event.Event | model.Learnable | null;
    eventLog: model.LogItem[];
    questNotification: boolean;
}

class TestComponent extends React.Component<TestProps, TestState> {
    overlayEl: EventOverlay | null = null;
    eventQueue: event.Event[];

    constructor(props: TestProps) {
        super(props);
        this.state = {
            happening: null,
            eventLog: [],
            questNotification: false,
        };
        this.eventQueue = [];
    }

    handleEventEffect = (effect: event.Effect, store: model.Store) => {
        if (effect instanceof event.LearnNextEffect) {
            effect.init(store);
        }

        const checklists = new Set();

        if (effect instanceof event.QuestEffect) {
            const stage = model.questStage(store, effect.questId);
            const qst = lookup.getQuest(effect.questId);
            if (stage === qst.complete) {
                // Don't update quests that were already completed
                return;
            }
            if (stage !== effect.stage || qst.checklists.get(stage)) {
                checklists.add(effect.questId);
                this.eventQueue.push(new event.QuestUpdatedEvent(
                    effect.questId,
                    effect.stage,
                    !stage
                ));
                this.setState({ questNotification: true });
            }
        }
        else if (effect instanceof event.LearnEffect) {
            // Guard against "" IDs
            if (effect.id && !model.hasLearned(store, effect.id) &&
                !effect.id.endsWith("reverse")) {
                const lastItem = this.eventQueue[this.eventQueue.length - 1];
                if (lastItem && lastItem instanceof event.LearnedEvent) {
                    lastItem.learnableIds.push(effect.id);
                }
                else {
                    this.eventQueue.push(new event.LearnedEvent([ effect.id ]));
                }
            }
        }
        else if (effect instanceof event.DiscoverEffect &&
                 !model.locationDiscovered(store, effect.location)) {
            const location = locations.getLocation(effect.location);
            this.eventQueue.push(new event.TextEvent(
                `New ${location.wanderlust ? "Location" : "Point of Interest"}: ${location.area || location.name}`,
                `You discovered ${location.name}.`
            ));
        }

        // Track status of quest checklists
        const beforeCkValues: Map<string, [ model.QuestStage, boolean[] ]> = new Map();
        [ ...lookup.getQuests().values() ]
            .map((q): [ string, model.QuestStage, quests.Checklist ] | null => {
                const stage = model.questStage(store, q.id);
                if (!stage) {
                    return null;
                }
                const ck = q.checklists.get(stage);
                if (!ck) {
                    return null;
                }
                return [ q.id, stage, ck ];
            })
            .forEach((q) => {
                if (!q || checklists.has(q[0])) {
                    return;
                }
                const [ id, stage, checklist ] = q;
                beforeCkValues.set(id, [ stage, checklist.map(c => c.filter.check(store))]);
            });

        this.props.handleEventEffect(effect, store);
        store = this.props.store;

        // Check if quest checklists changed
        [ ...lookup.getQuests().values() ]
            .map((q): [ model.QuestId, model.QuestStage, quests.Checklist ] | null => {
                const stage = model.questStage(store, q.id);
                if (!stage) {
                    return null;
                }
                const ck = q.checklists.get(stage);
                if (!ck) {
                    return null;
                }
                return [ q.id, stage, ck ];
            })
            .forEach((q) => {
                if (!q || checklists.has(q[0])) {
                    return;
                }
                const [ id, stage, checklist ] = q;

                let addNotification = false;
                if (!beforeCkValues.has(id)) {
                    addNotification = true;
                }
                else if (beforeCkValues.get(id) && beforeCkValues.get(id)![0] !== stage) {
                    return;
                }
                const beforeList = beforeCkValues.get(id)![1];
                const afterList = checklist.map(c => c.filter.check(store));

                for (let i = 0; i < beforeList.length; i++) {
                    if (beforeList[i] !== afterList[i]) {
                        this.eventQueue.push(new event.QuestUpdatedEvent(
                            id,
                            stage,
                            false,
                        ));

                        return;
                    }
                }
            });
    }

    onEvent = (happening: event.Event | model.LearnableId) => {
        let queuedEvents: event.Event[] = [];

        if (happening instanceof event.Event) {
            let showEvent = happening.showEvent;
            happening = happening.clone();

            if (happening instanceof event.MultiEvent) {
                queuedEvents = queuedEvents.concat(happening.getEvents());
            }

            if (happening instanceof event.FlavorEvent || happening instanceof event.QuestEvent) {
                // Dispatch effects now
                happening.effects.forEach((effect) => this.handleEventEffect(effect, this.props.store));
            }

            if (happening instanceof event.QuestEvent) {
                this.setState({ questNotification: true });
                showEvent = false; // Gets taken care of automatically
            }

            if (happening instanceof event.QuestionEvent) {
                if (happening.sequence !== null && happening.sequence > 0) {
                    for (let i = 0; i < happening.sequence; i++) {
                        const newQ = happening.clone();
                        // only apply effects after the sequence
                        // TODO: could be make more robust but this is how it's used currently
                        if (i < happening.sequence - 1) {
                            newQ.effects = [];
                        }
                        // Preserve sequence number so that we can use
                        // it as a key to a React component; this lets
                        // us force remounting so that separate questions
                        // don't appear to share state
                        // TODO: hacky--for now, negate sequence number to prevent re-sequencing
                        newQ.sequence = -i;
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
                this.setState({ happening: null });
            }
        }
        else {
            this.props.onLearn(happening);

            const logMessage = new event.LearnEffect(happening).toEventLog();
            if (logMessage !== null) {
                this.state.eventLog.push(logMessage);
            }
        }

        this.eventQueue = this.eventQueue.concat(queuedEvents);
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

    onReviewFinished = (correct: boolean) => {
        const happening = this.state.happening;
        if (happening && happening instanceof event.QuestionEvent) {
            const logText = happening.toResultEventLog(correct);
            if (logText !== null) {
                this.state.eventLog.push(logText);
            }
        }
    }

    onNavTabHint = (hint: string) => {
        this.onEvent(new event.FlavorEvent([], [], hint));
    }

    _cheatReplenish = (yen: number, stamina: number) => {
        this.handleEventEffect(new event.ResourceEffect("yen", yen), this.props.store);
        this.handleEventEffect(new event.ResourceEffect("stamina", stamina), this.props.store);
    }

    _cheatSwole = (maxStamina: number) => {
        this.handleEventEffect(new event.ResourceMaxEffect("stamina", maxStamina), this.props.store);
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
                    "You ascend to your ultimate form. " +
                    "Any understanding you had of proper Japanese etiquette has vanished. " +
                    "You become Ultra-Gaijin."
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

    componentDidMount() {
        // See index.tsx
        if ((window as any).gameLoaded) { //tslint:disable-line
            this.setState({
                eventLog: this.state.eventLog.concat([
                    {
                        body: "You wake up refreshed and ready to continue exploring the airport.",
                        annotations: [],
                        notes: [
                            "Save game loaded.",
                        ],
                    },
                ]),
            });
        }
    }

    componentDidUpdate() {
        if (!this.state.happening) {
            while (this.eventQueue.length > 0) {
                const ev = this.eventQueue.shift();
                if (!ev) {
                    return;
                }

                // Make sure event applies
                if (ev.check(this.props.store) || ev.filters.length === 0) {
                    this.onEvent(ev);
                    // this.setState({ happening: ev });
                    return;
                }
            }
        }
    }

    /**
     *  Callback for when an item has been mastered.
     *  Queues an event that rewards the player.
     *  TODO: make this data-driven
     */
    onMaster(id: model.LearnableId) {
        const learnable = lookup.getLearnable(id);
        switch (learnable.collection) {
            case "hira-basic": {
                const yenReward = 100;
                const eventText =
                    `Congratulations! You've mastered the hiragana ${learnable.front}. ` +
                    `As a reward for your accomplishments, you've received ${yenReward} yen.`;
                this.eventQueue.push(
                    new event.FlavorEvent(
                        [],
                        [new event.ResourceEffect("yen", yenReward)],
                        `Congrats! You've mastered ${learnable.front}.`,
                        false)
                    );
                this.eventQueue.push(
                    new event.TextEvent(
                        "Hiragana Mastered",
                        eventText)
                    );
                break;
            }
            case "vocab-basic-colors":
            case "vocab-basic-numbers": {
                const yenReward = 200;
                const eventText =
                    `Congratulations! You've mastered the word ${learnable.front}. ` +
                    `As a reward for your accomplishments, you've received ${yenReward} yen.`;
                this.eventQueue.push(
                    new event.FlavorEvent(
                        [],
                        [new event.ResourceEffect("yen", yenReward)],
                        `Congrats! You've mastered ${learnable.front}.`,
                        false)
                    );
                this.eventQueue.push(
                    new event.TextEvent(
                        "Word Mastered",
                        eventText)
                    );
                break;
            }
            default:
                break;
        }

    }

    componentWillUpdate(nextProps: TestProps) {
        let { store } = this.props;

        // Track mastered learned items
        const oldMastered = lookup.getMastered(store.learned);

        store = nextProps.store;

        // Check if mastered learned items changed
        const newMastered = lookup.getMastered(store.learned);

        // Trigger event for every newly mastered item
        newMastered.forEach((learned, id) => {
            if (!id) {
                return;
            }
            if (!oldMastered.has(id)) {
                this.onMaster(id);
            }
        });
    }

    highlightOverlay = () => {
        if (this.overlayEl) {
            // Unfocus the button so that space/enter will work to clear the event dialog
            if (document.activeElement && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            this.overlayEl.highlight();
        }
    }

    saveOverlay = (el: EventOverlay | null) => {
        this.overlayEl = el;
    }

    render() {
        const { store, onReview, onLearn } = this.props;
        const { learned, flags, collections, steps, location } = store;

        const allowNavigation = !this.state.happening ||
                                (this.state.happening instanceof event.Event ?
                                 this.state.happening.allowNavigation : true);

        const labels = [
            {
                label: "World",
                url: "Area",
                enabled: true,
                visible: true,
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
                enabled: allowNavigation,
                visible: this.props.store.learned.size > 0,
                hint: allowNavigation ?
                      "Maybe wandering around will give you some vocabulary to collect."
                    : "Can't view collections while answering a question.",
                onHint: this.onNavTabHint,
            },
            {
                label: "Quests",
                url: "Quests",
                enabled: true,
                visible: this.props.store.quests.size > 0,
                hint: "Maybe wandering around will give you some things to do.",
                onHint: this.onNavTabHint,
                alert: this.state.questNotification,
                clearAlert: () => this.setState({ questNotification: false }),
            },
            {
                label: "Wardrobe",
                url: "Wardrobe",
                enabled: true,
                visible: store.wardrobe.themes.size > 1 || store.wardrobe.hats.size > 0,
                hint: "",
                onHint: this.onNavTabHint,
            },
        ];

        return (
            <main>
                <div id="LeftPanel">
                    <Inventory resources={store.resources} />
                    <EventOverlay
                        ref={this.saveOverlay}
                        store={this.props.store}
                        happening={this.state.happening}
                        onReviewFinished={this.onReviewFinished}
                        onReview={this.props.onReview}
                        handleEventEffect={this.handleEventEffect}
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
                            onPaused={this.highlightOverlay}
                            eventLog={this.state.eventLog}
                            clearAlert={this.props.clearAlert}
                            isQuizMode={this.state.happening instanceof event.QuestionEvent}
                        />
                        <CollectionList collections={collections} learned={learned} />
                        <QuestLog store={store} />
                        <Wardrobe store={store} dispatch={this.handleEventEffect} />
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
        clearAlert: (name: string) => {
            dispatch(actions.updateFlag(name, true));
        },
        modifyResource: (resource: model.Resource, amount: number) => {
            dispatch(actions.modifyResource(resource, amount));
        },
        handleEventEffect: (effect: event.Effect, store: model.Store) => {
            dispatch(effect.toAction());
        },
    })
)(TestComponent as React.ComponentType<TestProps>);

export default class App extends React.Component {
    resetGame = () => {
        window.localStorage["save-state"] = "";
        window.location.reload();
    }

    render() {
        return (
            <div className="App">
                <h1>I Sudoku'd And Was Reborn in Japan, But I'm a
                Ninja Stuck in Narita Airport And I Don't Speak Any
                Japanese</h1>
                <h1>切腹をしたら、成田空港から脱出できない忍者として転生したが、日本語が全く喋れない‼︎</h1>
                <Test/>
                <a target="_blank" href="credits.html">Credits</a>
                &nbsp;
                <a href="#" onClick={this.resetGame}>Reset Game</a>
            </div>
        );
    }
}
