import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";
import * as event from "../model/event";
import * as question from "../model/question";
import * as resources from "../data/constants/resources";
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

    onEvent: (happening: event.Event | model.Learnable) => void;
    onWander: () => void;
    modifyResource: (resource: model.Resource, amount: number) => void;
}

export default class ActionPanel extends React.Component<Props> {
    wander = () => {
        const { store, paused, onEvent, onWander, modifyResource } = this.props;
        if (paused) {
            return;
        }

        const happening = wander(store);
        onWander();
        modifyResource(resources.STAMINA, -resources.WANDER_STA_COST);
        if (happening) {
            onEvent(happening);
        }
    }

    meditate = () => {
        const { store, paused, onEvent, modifyResource } = this.props;
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

    haulLuggage = () => {
        const { store, paused, onEvent } = this.props;
        onEvent(events.luggageEvent[0]);
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

        const staminaProp = store.resources.get(resources.STAMINA);
        const stamina = staminaProp ? staminaProp.currentValue : 0;

        // TODO: make actionbutton also ignore click when paused
        return (
            <LabeledPanel title="Actions" id="actions">
                <div>
                    <ActionButton
                        label="Wander"
                        cost={`-${resources.WANDER_STA_COST} STA`}
                        onClick={this.wander}
                        paused={paused}
                        locked={stamina < resources.WANDER_STA_COST}
                        cooldown={1000}
                    />
                    {learned.size ?
                     <ActionButton
                         label="Meditate"
                         benefit={`+${-resources.MEDITATE_STA_COST} STA`}
                         onClick={this.meditate}
                         paused={paused}
                         cooldown={1000}
                     />
                     : false}
                    {store.flags.get("has-transliteration-job") ?
                    <ActionButton
                        label="Transliterate"
                        benefit="+¥"
                        onClick={this.transliterate}
                        cooldown={5000}
                        paused={paused}
                    />
                    : false}
                    {stamina >= resources.LUGGAGE_UNLOCK_STAMINA ||
                     store.flags.get("has-luggage-job") ?
                    <ActionButton
                        label="Haul Luggage"
                        benefit={`-${resources.LUGGAGE_STA_COST} STA`}
                        onClick={this.haulLuggage}
                        locked={stamina < resources.LUGGAGE_STA_COST}
                        paused={paused}
                        cooldown={2500}
                    />
                    : false}
                </div>

                <div>
                    {flags.get("vending-machine") ?
                     <ActionButton
                         label="Vending Machine"
                         cost="-¥100"
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
