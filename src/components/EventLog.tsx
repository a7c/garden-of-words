import * as immutable from "immutable";
import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import "../Common.css";
import "./EventLog.css";

import LabeledPanel from "./LabeledPanel";

interface Props {
    entries: string[];
}

export default class EventLog extends React.Component<Props> {
    // Dummy element, used to scroll event log to bottom
    dummy: HTMLElement | null;

    componentDidUpdate() {
        if (this.dummy) {
            this.dummy.scrollIntoView({ behavior: "smooth" });
        }
    }

    render() {
        const { entries } = this.props;
        return (
            <LabeledPanel title="Event Log" id="event-log">
                <ul>
                    <TransitionGroup>
                        {entries.map((entry, id) => (
                            <CSSTransition
                                key={id}
                                timeout={{ enter: 500, exit: 400 }}
                                classNames="fade"
                            >
                                <li key={id}>{entry}</li>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </ul>
                <div ref={el => (this.dummy = el)}/>
            </LabeledPanel>
        );
    }
}
