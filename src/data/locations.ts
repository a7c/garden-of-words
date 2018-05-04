import * as model from "../model/model";
import * as event from "../model/event";
import * as parsers from "./parsers";

const locationData = require("./locations.json");

export interface PointOfInterest {
    label: string;
    eventSource: model.Location;
    filters?: event.Filter[];
    cooldown: number;
    cost?: [ model.Resource, number ];
}

export interface LocationData {
    name: string;
    label?: string;
    area?: string;
    wanderName?: string;
    wanderlust: boolean;
    connected: model.Location[];
    pois: PointOfInterest[];
    /**
     *  The structures that should scroll by as the player wanders through
     *  the location.
     *  These should be filepaths to the images but with suffixes and file
     *  extensions removed.
     */
    structures: string[];
    wanderEvents?: event.EventPipeline;
}

let locations: { [key: string]: LocationData } | null = null;

export function getLocation(locationName: string) {
    if (locations === null) {
        locations = {};
        Object.keys(locationData).forEach((key) => {
            locationData[key].pois = locationData[key].pois.map((poi: any) => { //tslint:disable-line
                if (poi.filters) {
                    poi.filters = poi.filters.map(parsers.parseFilter);
                }
                return poi;
            });
            if (locationData[key].wanderEvents) {
                locationData[key].wanderEvents = parsers.parseEventPipeline(locationData[key].wanderEvents);
            }
            locations![key] = locationData[key];
        });
    }

    return locations![locationName];
}
