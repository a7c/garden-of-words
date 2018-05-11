import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as lookup from "../model/lookup";
import * as model from "../model/model";
import * as question from "../model/question";

import Router from "../router";
import Fade from "./Fade";
import Checklist from "./Checklist";
import QuestionComponent from "./Question";
import AudioButton from "./AudioButton";

import "../Common.css";
import "./Event.css";

interface EventProps {
    store: model.Store;

    event: event.Event;
    onFinished: () => void;
    onReview: (id: model.LearnableId, correct: boolean) => void;
    handleEventEffect: (effect: event.Effect, store: model.Store) => void;
}

interface FlavorProps {
    event: event.FlavorEvent;
}

interface QuestionProps {
    store: model.Store;

    event: event.QuestionEvent;
    onReview: (id: model.LearnableId, correct: boolean) => void;
    onNotHappening: () => void;
}

class Flavor extends React.Component<FlavorProps> {
    render() {
        return (
            <section className="Event">
                <p>{this.props.event.flavor}</p>
            </section>
        );
    }
}

class Quest extends React.Component<{ event: event.QuestEvent }> {
    render() {
        return (
            <section className="Event">
                <h2>{`New Quest: ${lookup.getQuest(this.props.event.quest).name}`}</h2>
                <p>{this.props.event.toEventLog()}</p>
            </section>
        );
    }
}

class Learned extends React.Component<{ event: event.LearnedEvent }> {
    showCollection(id: model.CollectionId) {
        Router.navigate([ "Collections", id ]);
    }

    render() {
        const items = [];

        for (const id of this.props.event.learnableIds) {
            const learnable = lookup.getLearnable(id);
            const collection = lookup.getCollection(learnable.collection);
            const type = {
                "hiragana": "Hiragana",
                "katakana": "Katakana",
                "vocab-kana-romaji": "Word Reading",
                "vocab-kana-romaji-reverse": "Word Reading",
                "vocab-kana-meaning": "Vocab Word",
                "vocab-kana-meaning-reverse": "Vocab Word",
            }[learnable.type] || "Item";

            items.push(
                <div key={id}>
                    <h2>Learned New {type}</h2>
                    <p>
                        <span className="front">{learnable.front}</span>&nbsp;
                        {lookup.getLearnablePrompt(learnable.type)}&nbsp;
                        <span className="back">{learnable.back}</span>
                        <AudioButton
                            id={learnable.id}
                        />
                    </p>
                    <p>
                        <em>This knowledge can come up when you meditate in the future.</em>
                    </p>
                    <button
                        onClick={() => this.showCollection(learnable.collection)}
                    >
                        View {collection.name}
                    </button>
                </div>
            );
        }

        return (
            <section className="Event Learned">
                {items}
            </section>
        );
    }
}

class QuestUpdated extends React.Component<{ event: event.QuestUpdatedEvent, store: model.Store }> {
    render() {
        const { store, event: ev } = this.props;
        const quest = lookup.getQuest(ev.quest);
        const text = ev.newQuest ? "Started" : (ev.stage === quest.complete ? "Completed" : "Updated");
        const checklist = quest.checklists.get(ev.stage);
        return (
            <section className="Event">
                <h2>{`Quest ${text}: ${quest.name}`}</h2>
                <p>{this.props.event.toEventLog()}</p>
                {checklist ?
                 <Checklist store={store} checklist={checklist} />
                 : false}
            </section>
        );
    }
}

class Question extends React.Component<QuestionProps> {
    question: question.Question;

    constructor(props: QuestionProps) {
        super(props);

        if ("makeQuestion" in this.props.event.question) {
            const [ q, successEfx, failEfx ] =
                this.props.event.question.makeQuestion(this.props.store);
            this.question = q;
            successEfx.forEach(e => this.props.event.effects.push(e));
            failEfx.forEach(e => this.props.event.failureEffects.push(e));
        }
        else {
            this.question = this.props.event.question;
        }
    }

    render() {
        return (
            <section className="Event" key={this.props.event.sequence || 0}>
                {this.props.event.flavor ? <p>{this.props.event.flavor}</p> : false}
                <QuestionComponent
                    key={this.props.event.sequence || 0}
                    question={this.question}
                    store={this.props.store}
                    onReview={this.props.onReview}
                    onNotHappening={this.props.onNotHappening}
                />
            </section>
        );
    }
}

export default class EventComponent extends React.Component<EventProps> {
    fade: Fade | null;

    constructor(props: EventProps) {
        super(props);
        this.fade = null;
    }

    onFinished = () => {
        const ev = this.props.event;
        if (ev instanceof event.FlavorEvent) {
            ev.effects.forEach((effect) => this.props.handleEventEffect(effect, this.props.store));
        }

        this.props.onFinished();
    }

    onQuestionFinished = (id: model.LearnableId, correct: boolean) => {
        const ev = this.props.event;

        if (ev instanceof event.QuestionEvent) {
            if (correct) {
                ev.effects.forEach((effect) => this.props.handleEventEffect(effect, this.props.store));
            }
            else {
                ev.failureEffects.forEach((effect) => this.props.handleEventEffect(effect, this.props.store));
            }
        }
        else {
            throw "Finished question event but event is not a question event?";
        }

        this.props.onReview(id, correct);
    }

    showQuests = () => {
        Router.navigate([ "Quests" ]);
        this.onFinished();
    }

    componentWillMount() {
        document.addEventListener("keydown", this.onKey, true);
    }

    componentDidMount() {
        // Unfocus the button so that space/enter will work below
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKey, true);
    }

    onKey = (e: KeyboardEvent) => {
        switch (e.code) {
            case "Space":
            case "Enter": {
                // Auto-accept the default
                if (this.props.event instanceof event.FlavorEvent ||
                    this.props.event instanceof event.QuestEvent ||
                    this.props.event instanceof event.LearnedEvent ||
                    this.props.event instanceof event.QuestUpdatedEvent) {
                    this.props.onFinished();
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            }
            default:
                break;
        }
    }

    render() {
        const ev = this.props.event;
        let contents: JSX.Element | JSX.Element[] = <span/>;

        if (ev instanceof event.FlavorEvent) {
            contents = [
                <Flavor key="flavor" event={ev} />,
                (
                    <button
                        key="confirm"
                        onClick={this.props.onFinished}
                    >
                        Confirm
                    </button>
                ),
            ];
        }
        else if (ev instanceof event.QuestEvent) {
            contents = [
                <Quest key="quest" event={ev} />,
                (
                    <div key="class-buttons" className="event-buttons">
                        <button
                            key="view-quest-log"
                            onClick={this.showQuests}
                        >
                            View Quest Log
                        </button>
                        <button
                            key="accept-quest"
                            onClick={this.props.onFinished}
                        >
                            <strong>Accept Quest</strong>
                        </button>
                    </div>
                ),
            ];
        }
        else if (ev instanceof event.QuestUpdatedEvent) {
            contents = [
                <QuestUpdated key="quest-updated" event={ev} store={this.props.store} />,
                (
                    <div key="class-buttons" className="event-buttons">
                        <button
                            key="view-quest-log"
                            onClick={this.showQuests}
                        >
                            View Quest Log
                        </button>
                        <button
                            key="accept-quest"
                            onClick={this.props.onFinished}
                        >
                            <strong>Continue</strong>
                        </button>
                    </div>
                ),
            ];
        }
        else if (ev instanceof event.LearnedEvent) {
            contents = [
                <Learned key="learned" event={ev} />,
                (
                    <div key="class-buttons" className="event-buttons">
                        <button
                            key="accept-quest"
                            onClick={this.props.onFinished}
                        >
                            <strong>Continue</strong>
                        </button>
                    </div>
                ),
            ];
        }
        else if (ev instanceof event.QuestionEvent) {
            contents = (
                <Question
                    key="question"
                    event={ev}
                    store={this.props.store}
                    onReview={this.onQuestionFinished}
                    onNotHappening={this.onFinished}
                />
            );
        }
        else {
            contents = <p key="error">Unsupported event!</p>;
        }

        return (
            <Fade onFinished={this.onFinished} ref={f => (this.fade = f)}>
                <div className="PopupBox">
                    {contents}
                </div>
            </Fade>
        );
    }
}
