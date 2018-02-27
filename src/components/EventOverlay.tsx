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
    happening: Question | event.Event | model.Learnable | null;
    onNotHappening: () => void;
    onReviewFinished: (id: model.LearnableId, correct: boolean) => void;
}

interface State {
    showing: boolean;
}

export default class EventOverlay extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { showing: true };
    }

    onEventFinished = () => {
        this.onNotHappening();
    }

    onReview = (id: model.LearnableId, correct: boolean) => {
        this.props.onReviewFinished(id, correct);
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

    render() {
        const { happening } = this.props;

        let body = null;
        if (happening instanceof event.Event) {
            body = <EventComponent event={happening} onFinished={this.onEventFinished} />;
        }
        else if (happening instanceof Question) {
            body = <QuestionComponent question={happening} onReview={this.onReview} />;
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
                <section id="event-overlay" className={body === null ? "hidden" : ""}>
                    {body}
                </section>
            </CSSTransition>
        );
    }
}
