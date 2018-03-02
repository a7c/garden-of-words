import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as event from "../model/event";
import * as model from "../model/model";
import * as question from "../model/question";

import Fade from "./Fade";
import QuestionComponent from "./Question";

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
}

class Flavor extends React.Component<FlavorProps> {
    render() {
        return (
            <section className="Event">
                {this.props.event.flavor}
            </section>
        );
    }
}

class Question extends React.Component<QuestionProps> {
    question: question.Question;

    constructor(props: QuestionProps) {
        super(props);
        this.question = this.props.event.question.makeQuestion(this.props.store);
    }

    render() {
        return (
            <section className="Event">
                {this.props.event.flavor ? <p>{this.props.event.flavor}</p> : false}
                <QuestionComponent question={this.question} onReview={this.props.onReview} />
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
        let contents = <span/>;
        const button = (
            <button
                onClick={() => this.fade ? this.fade.exit() : null}
            >
                Continue
            </button>
        );
        if (ev instanceof event.FlavorEvent) {
            contents = <Flavor key="flavor" event={ev} />;
        }
        else if (ev instanceof event.QuestionEvent) {
            contents = (
                <Question
                    key="question"
                    event={ev}
                    store={this.props.store}
                    onReview={this.onQuestionFinished}
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
