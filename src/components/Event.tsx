import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as event from "../model/event";
import * as model from "../model/model";

import Fade from "./Fade";

interface EventProps {
    event: event.Event;
    onFinished: () => void;
}

interface FlavorProps {
    event: event.FlavorEvent;
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

export default class EventComponent extends React.Component<EventProps> {
    fade: Fade | null;

    constructor(props: EventProps) {
        super(props);
        this.fade = null;
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
        else {
            contents = <p key="error">Unsupported event!</p>;
        }

        return (
            <Fade onFinished={this.props.onFinished} ref={f => (this.fade = f)}>
                <div className="PopupBox">
                    {contents}
                    {button}
                </div>
            </Fade>
        );
    }
}
