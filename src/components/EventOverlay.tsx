import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as model from "../model/model";
import { Question } from "../model/question";

import "../Common.css";
import "./EventOverlay.css";

import EventComponent from "./Event";
import LearnedSomething from "./LearnedSomething";
import QuestionComponent from "./Question";

interface Props {
    store: model.Store;

    happening: event.Event | model.Learnable | null;
    onNotHappening: () => void;
    onReview: (id: model.LearnableId, correct: boolean) => void;
    onReviewFinished: (correct: boolean) => void;
    handleEventEffect: (effect: event.Effect, store: model.Store) => void;
}

interface State {
    showing: boolean;
}

export default class EventOverlay extends React.Component<Props, State> {
    overlayEl: HTMLElement | null = null;

    constructor(props: Props) {
        super(props);
        this.state = { showing: true };
    }

    onEventFinished = () => {
        this.onNotHappening();
    }

    onNotHappening() {
        setTimeout(() => this.setState({ showing: false }), 500);
        setTimeout(
            () => {
                this.props.onNotHappening();
                this.setState({ showing: true });
            },
            1000
        );
    }

    highlight = () => {
        if (this.overlayEl) {
            this.overlayEl.style.animation = "";
            this.overlayEl.style.animation = "0.8s 2 highlight-event ease-in-out";
        }
    }

    saveEl = (el: HTMLElement | null) => {
        this.overlayEl = el;
    }

    onAnimationEnd = () => {
        if (this.overlayEl) {
            this.overlayEl.style.animation = "";
        }
    }

    render() {
        const { happening } = this.props;

        let body = null;
        if (happening instanceof event.Event) {
            body = (
                <EventComponent
                    store={this.props.store}
                    event={happening}
                    onFinished={this.onEventFinished}
                    onReview={this.props.onReview}
                    onReviewFinished={this.props.onReviewFinished}
                    handleEventEffect={this.props.handleEventEffect}
                />
            );
        }
        else if (happening) {
            body = <LearnedSomething learnable={happening} onFinished={this.props.onNotHappening} />;
        }

        return (
            <CSSTransition
                timeout={500}
                in={body !== null && this.state.showing}
                classNames="effect-slide-up"
            >
                <section
                    id="event-overlay"
                    ref={this.saveEl}
                    className={body === null ? "hidden" : ""}
                    onAnimationEnd={this.onAnimationEnd}
                >
                    {body}
                </section>
            </CSSTransition>
        );
    }
}
