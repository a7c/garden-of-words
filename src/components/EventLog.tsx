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
    render() {
        const { entries } = this.props;
        const latest = entries.slice().reverse();
        return (
            <LabeledPanel title="Event Log" id="event-log">
                <ul>
                    <TransitionGroup>
                        {latest.map((entry, id) => (
                            <CSSTransition
                                key={entries.length - id}
                                timeout={{ enter: 500, exit: 400 }}
                                classNames="fade"
                            >
                                <li key={id}>{entry}</li>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </ul>
            </LabeledPanel>
        );
    }
}
