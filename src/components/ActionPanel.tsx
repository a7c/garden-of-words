import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";
import * as event from "../model/event";
import * as question from "../model/question";
import * as resources from "../model/resources";
import * as locations from "../data/locations";
import wander from "../wander";
import meditate from "../meditate";

import "../Common.css";
import "./ActionPanel.css";

import ActionButton from "./ActionButton";
import LabeledPanel from "./LabeledPanel";

interface Props {
    store: model.Store;
    paused: boolean;

    onEvent: (happening: event.Event | model.LearnableId) => void;
    onWander: () => void;
    modifyResource: (resource: model.Resource, amount: number) => void;
}

export default class ActionPanel extends React.Component<Props> {
    wanderHelper(stamina: number, location: model.Location | null) {
        const { store, paused, onEvent, onWander, modifyResource } = this.props;
        if (paused) {
            return;
        }

        const modStore = location === null ? store :
                         store.set("location", store.location.set("current", location));
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
    haulLuggage = () => this.wanderHelper(-resources.LUGGAGE_STA_COST, "luggage-job");

    onHint = (hint: string) => {
        this.props.onEvent(new event.FlavorEvent([], [], hint));
    }

    meditate = () => {
        const { store, paused, onEvent, modifyResource } = this.props;
        if (paused) {
            return;
        }

        const happening = meditate(store);
        if (happening) {
            onEvent(happening);
        }
    }

    travel = (location: model.Location) => {
        this.props.onEvent(new event.FlavorEvent(
            [],
            [
                new event.TravelEffect(location),
            ],
            ""
        ));
    }

    formatCost(costInfo: [ model.Resource, number ] | undefined) {
        if (!costInfo) {
            return "";
        }
        const [ resource, cost ] = costInfo;
        // TODO: full lookup table
        const resourceLabel = resource === "yen" ? "¥" : resource;
        return `${cost < 0 ? "" : "-"}${resourceLabel}${cost}`;
    }

    render() {
        const { store, paused } = this.props;
        const { learned, flags, location } = store;

        const locationData = locations.getLocation(location.current);

        const staminaProp = store.resources.get(resources.STAMINA);
        const stamina = staminaProp ? staminaProp.currentValue : 0;

        const pois: JSX.Element[] = [];
        const adjacent: JSX.Element[] = [];
        locationData.pois.forEach((poi, idx) => {
            if (!poi.filter || poi.filter.check(store)) {
                pois.push(
                    <ActionButton
                        key={idx}
                        label={poi.label}
                        cost={this.formatCost(poi.cost)}
                        onClick={() => this.wanderHelper(0, poi.eventSource)}
                        paused={paused}
                        cooldown={poi.cooldown}
                    />
                );
            }
        });

        locationData.connected.forEach((loc, idx) => {
            if (model.locationDiscovered(store, loc)) {
                const targetLoc = locations.getLocation(loc);
                const button = (
                    <ActionButton
                        key={idx}
                        label={targetLoc.label || targetLoc.name}
                        paused={paused}
                        onClick={() => this.travel(loc)}
                    />
                );

                if (targetLoc.wanderlust) {
                    adjacent.push(button);
                }
                else {
                    pois.push(button);
                }
            }
        });

        return (
            <LabeledPanel title="Actions" id="actions">
                <div>
                    {(adjacent.length === 1 && !locationData.wanderlust) ? adjacent : false}
                    {locationData.wanderlust ?
                     <ActionButton
                         label={`Wander in ${locationData.wanderName || locationData.name}`}
                         cost={`-${resources.WANDER_STA_COST} STA`}
                         onClick={this.wander}
                         paused={paused}
                         locked={stamina < resources.WANDER_STA_COST}
                         cooldown={1000}
                         hint={locationData.wanderlust ?
                              "You need stamina to wander. Try meditating." :
                              "This doesn't look like a good area to wander around in."}
                         onHint={this.onHint}
                     />
                     : false}
                    {(learned.size && locationData.wanderlust) ?
                     <ActionButton
                         label="Meditate"
                         benefit={`+${-resources.getMeditateStaminaCost(store)} STA`}
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
                    {store.flags.get("has-luggage-job") && location.current === "airport-gate" ?
                    <ActionButton
                        label="Haul Luggage"
                        benefit={`-${resources.LUGGAGE_STA_COST} STA`}
                        onClick={this.haulLuggage}
                        locked={stamina < resources.LUGGAGE_STA_COST}
                        paused={paused}
                        cooldown={2500}
                        hint="Grabbing a drink from the vending machine might get your stamina up."
                        onHint={this.onHint}
                    />
                    : false}
                </div>

                <div>
                    {pois}
                </div>

                {/* TODO: want some model of what is adjacent to
                what. Also, reusable component for this would be
                nice. */}
                <div>
                    {(adjacent.length > 1 || locationData.wanderlust) ? adjacent : false}
                    {model.questStarted(store, "airport-train-station") ?
                    <ActionButton
                        label="Train Station"
                        locked={true}
                        paused={paused}
                        hint="You've got no clue where to take the train."
                        onHint={this.onHint}
                    />
                    : false}
                </div>
            </LabeledPanel>
        );
    }
}
