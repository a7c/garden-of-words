import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";

import * as actions from "../actions/actions";
import * as model from "../model/model";
import * as event from "../model/event";
import * as question from "../model/question";
import meditate from "../meditate";
import wander from "../wander";

import "../Common.css";
import "./Streets.css";

import ActionPanel from "./ActionPanel";
import EventLog from "./EventLog";

interface Props {
    paused: boolean;
    store: model.Store;
    eventLog: model.LogItem[];
    // True if player is being tested on something. Determines whether we render event log contents.
    isQuizMode: boolean;

    onWander: () => void;
    modifyResource: (resource: model.Resource, amount: number) => actions.Action;
    onEvent: (happening: event.Event | model.LearnableId) => void;
    onPaused: () => void;
    clearAlert: (name: string) => void;
}

export default class Streets extends React.Component<Props> {
    render() {
        const { store } = this.props;
        return (
            <div id="streets">
                <EventLog
                    entries={this.props.eventLog}
                    hideLog={this.props.isQuizMode}
                />
                <ActionPanel
                    store={store}
                    onWander={this.props.onWander}
                    modifyResource={this.props.modifyResource}
                    onEvent={this.props.onEvent}
                    paused={this.props.paused}
                    onPaused={this.props.onPaused}
                    clearAlert={this.props.clearAlert}
                />
            </div>
        );
    }
}
