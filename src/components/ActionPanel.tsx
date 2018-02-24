import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";
import * as event from "../model/event";
import * as question from "../model/question";
import wander from "../wander";

import "../Common.css";
import "./ActionPanel.css";

import ActionButton from "./ActionButton";
import LabeledPanel from "./LabeledPanel";

interface Props {
    store: model.Store;
    paused: boolean;

    onEvent: (happening: question.Question | event.Event | model.Learnable) => void;
}

export default class ActionPanel extends React.Component<Props> {
    wander = () => {
        if (this.props.paused) {
            return;
        }

        const happening = wander(this.props.store);
        if (happening) {
            this.props.onEvent(happening);
        }
    }

    render() {
        const { store } = this.props;
        const { learned, flags } = store;

        // TODO: make actionbutton also ignore click when paused
        return (
            <LabeledPanel title="Actions" id="actions">
                <div>
                    <ActionButton label="Wander" onClick={this.wander} />
                    {learned.size ? <ActionButton label="Meditate" /> : false}
                    <ActionButton label="Transliterate" cost="+5 YEN" />
                </div>

                <div>
                    {flags.get("vending-machine") ? <ActionButton label="Vending Machine" /> : false}
                </div>

                <div>
                    <ActionButton label="Subway" locked={true} />
                </div>
            </LabeledPanel>
        );
    }
}
