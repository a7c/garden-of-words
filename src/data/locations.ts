import * as model from "../model/model";

const locations = require("./locations.json");

export interface PointOfInterest {
    label: string;
    eventSource: model.Location;
    flag?: model.Flag;
    cooldown: number;
    cost?: [ model.Resource, number ];
}

export interface LocationData {
    name: string;
    label?: string;
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
}

export default locations as { [key: string]: LocationData };
