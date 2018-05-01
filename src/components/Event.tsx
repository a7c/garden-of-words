import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as lookup from "../model/lookup";
import * as model from "../model/model";
import * as question from "../model/question";

import Fade from "./Fade";
import QuestionComponent from "./Question";

import "../Common.css";
import "./Event.css";

interface EventProps {
    store: model.Store;

    event: event.Event;
    onFinished: () => void;
    onReview: (id: model.LearnableId, correct: boolean) => void;
    handleEventEffect: (effect: event.Effect) => void;
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

class QuestUpdated extends React.Component<{ event: event.QuestUpdatedEvent, store: model.Store }> {
    render() {
        const { store, event: ev } = this.props;
        const quest = lookup.getQuest(ev.quest);
        const text = ev.stage === quest.complete ? "Completed" : "Updated";
        const checklist = quest.checklists.get(ev.stage);
        return (
            <section className="Event">
                <h2>{`Quest ${text}: ${quest.name}`}</h2>
                <p>{this.props.event.toEventLog()}</p>
                {checklist ?
                 (
                     <ul className="checklist">
                         {checklist.map(({ description, filter }) => (
                             <li>
                                 <input
                                     type="checkbox"
                                     disabled={true}
                                     checked={filter.check(store)}
                                 />
                                 {description}
                             </li>
                         ))}
                     </ul>
                 )
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
            ev.effects.forEach(this.props.handleEventEffect);
        }

        this.props.onFinished();
    }

    onQuestionFinished = (id: model.LearnableId, correct: boolean) => {
        const ev = this.props.event;

        if (ev instanceof event.QuestionEvent) {
            if (correct) {
                ev.effects.forEach(this.props.handleEventEffect);
            }
            else {
                ev.failureEffects.forEach(this.props.handleEventEffect);
            }
        }
        else {
            throw "Finished question event but event is not a question event?";
        }

        this.props.onReview(id, correct);
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
                    <button
                        key="accept-quest"
                        onClick={this.props.onFinished}
                    >
                        Accept Quest
                    </button>
                ),
            ];
        }
        else if (ev instanceof event.QuestUpdatedEvent) {
            contents = [
                <QuestUpdated key="quest-updated" event={ev} store={this.props.store} />,
                (
                    <button
                        key="accept-quest"
                        onClick={this.props.onFinished}
                    >
                        Continue
                    </button>
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
