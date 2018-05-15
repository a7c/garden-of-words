import * as immutable from "immutable";
import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as model from "../model/model";

import "../Common.css";
import "./EventLog.css";

import LabeledPanel from "./LabeledPanel";

interface Props {
    entries: model.LogItem[];
    hideLog: boolean;
}

class LogEntry extends React.Component<{ entry: model.LogItem }> {
    render() {
        const { entry } = this.props;
        if (typeof entry === "string") {
            return entry;
        }
        return (
            <div>
                {entry.body}
                {entry.annotations.map((annotation) => (
                    <span className="annotation">[{annotation}]</span>
                ))}
                {entry.notes.length > 0 ?
                 (
                     <ul className="notes">
                         {entry.notes.map((text, idx) => (
                             <li key={idx}>{text}</li>
                         ))}
                     </ul>
                 )
                 : false}
            </div>
        );
    }
}

export default class EventLog extends React.Component<Props> {
    // Dummy element, used to scroll event log to bottom
    dummy: HTMLElement | null;

    componentDidUpdate() {
        if (this.dummy) {
            // scrollIntoView scrolls the entire body in Firefox,
            // which is annoying because we have the hidden question
            // element
            (this.dummy.parentNode! as any).scrollTop = 0; //tslint:disable-line
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
                                <li key={id}>
                                    <LogEntry entry={entry} />
                                </li>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </ul>
            );
        }
        else {
            content = (
                <div className="log-hidden">
                    <p>
                        You clear your mind of distractions and meditate on what you've learned.
                    </p>
                </div>
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
