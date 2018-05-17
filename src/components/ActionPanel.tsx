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
    onPaused: () => void;
    clearAlert: (name: string) => void;
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
    transliterate = () => this.wanderHelper(-resources.TRANSLITERATE_STA_COST, "transliterate-job");
    haulLuggage = () => this.wanderHelper(-resources.LUGGAGE_STA_COST, "luggage-job");

    onHint = (hint: string) => {
        const hintText = Math.random() > 0.8 ?
                         "Your Professor's words echoed - there's a time and a place for everything, but not now!" :
                         hint;
        this.props.onEvent(new event.FlavorEvent([], [], hintText));
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

    watchNews = () => this.wanderHelper(0, "watch-news");

    // buyTicket = () => console.log("Not yet implemented");

    formatCost(costInfo: [ model.Resource, number ] | undefined) {
        if (!costInfo) {
            return "";
        }
        const [ resource, cost ] = costInfo;
        // TODO: full lookup table
        const resourceLabel = resource === "yen" ? "¥" : resource;
        return `${cost < 0 ? "" : "-"}${resourceLabel}${cost}`;
    }

    isNewButton(name: string) {
        return !this.props.store.flags.get(`button-${name}`);
    }

    clearAlert(name: string) {
        return this.props.clearAlert(`button-${name}`);
    }

    render() {
        const { store, paused } = this.props;
        const { learned, flags, location } = store;

        const locationData = locations.getLocation(location.current);
        const isSubArea = /*adjacent.length === 1 &&*/ !locationData.wanderlust;

        const staminaProp = store.resources.get(resources.STAMINA);
        const stamina = staminaProp ? staminaProp.currentValue : 0;

        const pois: JSX.Element[] = [];
        const adjacent: JSX.Element[] = [];
        locationData.pois.forEach((poi, idx) => {
            if (!poi.filters || poi.filters.map(f => f.check(store)).every(x => x)) {
                pois.push(
                    <ActionButton
                        key={`poi-${idx}`}
                        label={poi.label}
                        cost={this.formatCost(poi.cost)}
                        onClick={() => this.wanderHelper(0, poi.eventSource)}
                        paused={paused}
                        onPaused={this.props.onPaused}
                        cooldown={poi.cooldown}
                        alert={this.isNewButton(`poi-${poi.label}`)}
                        clearAlert={() => this.clearAlert(`poi-${poi.label}`)}
                    />
                );
            }
        });

        locationData.connected.forEach((loc, idx) => {
            const targetLoc = locations.getLocation(loc);
            const locked = !model.locationDiscovered(store, loc);
            const button = (
                <ActionButton
                    key={`loc-${loc}`}
                    label={`${isSubArea ? "Back to " : ""}${targetLoc.label || targetLoc.name}`}
                    locked={locked}
                    paused={paused}
                    onPaused={this.props.onPaused}
                    onClick={() => this.travel(loc)}
                    onHint={locked ? this.onHint : undefined}
                    hint={targetLoc.lockedMessage || "You don't know where that is yet."}
                    alert={this.isNewButton(`location-${loc}`) && !locked}
                    clearAlert={() => this.clearAlert(`location-${loc}`)}
                />
            );

            if (targetLoc.wanderlust) {
                adjacent.push(button);
            }
            else {
                pois.push(button);
            }
        });

        if (model.questStarted(store, "airport-train-station") &&
            locationData.connected.indexOf("airport-gate")) {
            const button = (
                <ActionButton
                    key="trainstation"
                    label="Train Station"
                    locked={
                        model.questStage(store, "airport-train-station") === "just-arrived"
                    }
                    paused={paused}
                    onPaused={this.props.onPaused}
                    hint="You've got no clue where to take the train."
                    onClick={() => this.travel("airport-train-station")}
                    onHint={this.onHint}
                />
            );
            adjacent.push(button);
        }

        const staminaHint: string = "You don't have enough stamina for this. Try meditating.";
        const wanderHint: string = locationData.wanderlust ?
                                   "You need stamina to wander. Try meditating." :
                                   "This doesn't look like a good area to wander around in.";
        const transliterateHint: string = staminaHint;

        let luggageHint: string;
        if (staminaProp.maxValue != null && staminaProp.maxValue < resources.LUGGAGE_STA_COST) {
            luggageHint = "Grabbing a drink from the vending machine might get your stamina up.";
        } else {
            luggageHint = staminaHint;
        }

        return (
            <section id="actions">
                <header>
                    <h2>{locationData.area}</h2>
                </header>
                <div id="actions-body">
                    <div>
                        {isSubArea ? adjacent[0] : false}
                        {locationData.wanderlust ?
                         <ActionButton
                             label={`Wander in ${locationData.wanderName || locationData.name}`}
                             cost={`-${resources.WANDER_STA_COST} STA`}
                             onClick={this.wander}
                             paused={paused}
                             onPaused={this.props.onPaused}
                             locked={stamina < resources.WANDER_STA_COST}
                             cooldown={1000}
                             hint={wanderHint}
                             onHint={this.onHint}
                         />
                         : false}
                        {learned.size ?
                         <ActionButton
                             label="Meditate"
                             benefit={`+${-resources.getMeditateStaminaCost(store)} STA`}
                             onClick={this.meditate}
                             paused={paused}
                             onPaused={this.props.onPaused}
                             cooldown={1000}
                             alert={this.isNewButton("meditate")}
                             clearAlert={() => this.clearAlert("meditate")}
                         />
                         : false}
                        {store.flags.get("has-transliteration-job") ?
                         <ActionButton
                             label="Transliterate (+50¥)"
                             cost={`-${resources.TRANSLITERATE_STA_COST} STA`}
                             onClick={this.transliterate}
                             cooldown={15000}
                             paused={paused}
                             onPaused={this.props.onPaused}
                             locked={stamina < resources.TRANSLITERATE_STA_COST}
                             alert={this.isNewButton("transliterate")}
                             clearAlert={() => this.clearAlert("transliterate")}
                             hint={transliterateHint}
                             onHint={this.onHint}
                         />
                         : false}
                        {store.flags.get("has-luggage-job") ?
                         <ActionButton
                             label="Haul Luggage (+¥¥)"
                             benefit={`-${resources.LUGGAGE_STA_COST} STA`}
                             onClick={this.haulLuggage}
                             locked={stamina < resources.LUGGAGE_STA_COST}
                             paused={paused}
                             onPaused={this.props.onPaused}
                             cooldown={2500}
                             hint={luggageHint}
                             onHint={this.onHint}
                             alert={this.isNewButton("luggage")}
                             clearAlert={() => this.clearAlert("luggage")}
                         />
                         : false}
                        {/*location.current === "airport-gate" ?
                         <ActionButton
                             label="Watch the news"
                             benefit={`+KANA`}
                             onClick={this.watchNews}
                             paused={paused}
                             onPaused={this.props.onPaused}
                             cooldown={2000}
                             alert={this.isNewButton("watch-news")}
                             clearAlert={() => this.clearAlert("watch-news")}
                         />
                         : false*/}
                    </div>

                    <div>
                        {pois}
                    </div>

                    <div>
                        {isSubArea ? (adjacent.length > 1 ? adjacent.slice(1, adjacent.length) : false) : adjacent}
                    </div>
                </div>
            </section>
        );
    }
}
