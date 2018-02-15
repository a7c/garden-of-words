import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as event from "../model/event";
import * as model from "../model/model";

import Dialog from "./Dialog";

interface EventProps {
    event: event.Event;
}

interface FlavorProps extends EventProps {
    event: event.FlavorEvent;
}

class Flavor extends React.Component<FlavorProps> {
    /* constructor(props: MultipleChoiceProps) {
     *     super(props);
     * }
     */
    render() {
        return (
            <section className="Event">
                {this.props.event.flavor}
            </section>
        );
    }
}

export default class EventComponent extends React.Component<EventProps> {
    constructor(props: EventProps) {
        super(props);
    }

    render() {
        const ev = this.props.event;
        if (ev instanceof event.FlavorEvent) {
            let contents = <Flavor key="flavor" event={ev} />;

            return (
                <TransitionGroup>
                    <CSSTransition
                        key="flavor"
                        timeout={{ enter: 1000, exit: 800 }}
                        classNames="fade"
                    >
                        {contents}
                    </CSSTransition>
                </TransitionGroup>
            );
        }
        else {
            return <p>Unsupported event!</p>;
        }
    }
}
