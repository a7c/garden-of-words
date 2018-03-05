import * as immutable from "immutable";
import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import "../Common.css";
import "./EventLog.css";

import LabeledPanel from "./LabeledPanel";

interface Props {
    entries: string[];
    hideLog: boolean;
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
        const { entries, hideLog } = this.props;
        const latest = entries.slice().reverse();

        let content = null;
        if (!hideLog) {
            content = (
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
            );
        }
        else {
            content = (
                <ul>
                    <li>(log hidden!)</li>
                </ul>
            );
        }

        return (
            <LabeledPanel title="Event Log" id="event-log">
                <div ref={el => (this.dummy = el)}/>
                {content}
            </LabeledPanel>
        );
    }
}
