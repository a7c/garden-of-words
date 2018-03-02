import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";
import * as event from "../model/event";
import * as question from "../model/question";
import wander from "../wander";
import meditate from "../meditate";
import events from "../data/events";

import "../Common.css";
import "./ActionPanel.css";

import ActionButton from "./ActionButton";
import LabeledPanel from "./LabeledPanel";

interface Props {
    store: model.Store;
    paused: boolean;

    onEvent: (happening: question.Question | event.Event | model.Learnable) => void;
    onWander: () => void;
}

export default class ActionPanel extends React.Component<Props> {
    wander = () => {
        const { store, paused, onEvent, onWander } = this.props;
        if (paused) {
            return;
        }

        const happening = wander(store);
        onWander();
        if (happening) {
            onEvent(happening);
        }
    }

    meditate = () => {
        const { store, paused, onEvent } = this.props;
        if (paused) {
            return;
        }

        const happening = meditate(store.learned);
        if (happening) {
            onEvent(happening);
        }
    }

    transliterate = () => {
        const { store, paused, onEvent } = this.props;

        onEvent(events.transliterate[1]);
    }

    vendingMachine = () => {
        const { store, paused, onEvent, onWander } = this.props;
        if (paused) {
            return;
        }

        const happening = wander(store.set("location", "vending-machine"));
        onWander();
        if (happening) {
            onEvent(happening);
        }
    }

    render() {
        const { store, paused } = this.props;
        const { learned, flags } = store;

        // TODO: make actionbutton also ignore click when paused
        return (
            <LabeledPanel title="Actions" id="actions">
                <div>
                    <ActionButton
                        label="Wander"
                        cost="-5 STA"
                        onClick={this.wander}
                        paused={paused}
                        cooldown={1000}
                    />
                    {learned.size ?
                     <ActionButton
                         label="Meditate"
                         cost="-5 STA"
                         onClick={this.meditate}
                         paused={paused}
                         cooldown={1000}
                     />
                     : false}
                    {learned.size > 3 ?
                    <ActionButton
                        label="Transliterate"
                        benefit="+¥"
                        onClick={this.transliterate}
                        cooldown={1000}
                        locked={!store.flags.get("has-transliteration-job")}
                        paused={paused}
                    />
                    : false}
                </div>

                <div>
                    {flags.get("vending-machine") ?
                     <ActionButton
                         label="Vending Machine"
                         cost="-100¥"
                         onClick={this.vendingMachine}
                         paused={paused}
                         cooldown={1000}
                     /> :
                     false}
                </div>

                <div>
                    <ActionButton label="Subway" locked={true} paused={paused} />
                </div>
            </LabeledPanel>
        );
    }
}
