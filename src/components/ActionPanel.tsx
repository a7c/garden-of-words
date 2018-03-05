import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";
import * as event from "../model/event";
import * as question from "../model/question";
import * as resources from "../data/constants/resources";
import wander from "../wander";
import meditate from "../meditate";

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
    wanderHelper(stamina: number, location: model.Location | null) {
        const { store, paused, onEvent, onWander, modifyResource } = this.props;
        if (paused) {
            return;
        }

        const modStore = location === null ? store : store.set("location", location);
        const happening = wander(modStore);
        onWander();
        if (stamina !== 0) {
            modifyResource(resources.STAMINA, stamina);
        }

        if (happening) {
            onEvent(happening);
        }
    }

    wander = () => this.wanderHelper(-resources.WANDER_STA_COST, null);
    transliterate = () => this.wanderHelper(0, "transliterate-job");
    vendingMachine = () => this.wanderHelper(0, "vending-machine");

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
