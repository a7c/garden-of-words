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
    eventLog: string[];

    onWander: () => void;
    onEvent: (happening: question.Question | event.Event | model.Learnable) => void;
}

export default class Streets extends React.Component<Props> {
    render() {
        const { store } = this.props;
        return (
            <div id="streets">
                <EventLog entries={this.props.eventLog} />
                <ActionPanel
                    store={store}
                    onWander={this.props.onWander}
                    onEvent={this.props.onEvent}
                    paused={this.props.paused}
                />
            </div>
        );
    }
}
