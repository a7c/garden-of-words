import * as model from "../model/model";

const locations = require("./locations.json");

export interface PointOfInterest {
    label: string;
    eventSource: model.Location;
    flag: model.Flag;
    cooldown: number;
    cost?: [ model.Resource, number ];
}

export interface LocationData {
    name: string;
    label?: string;
    pois: PointOfInterest[];
    connected: model.Location[];

    wanderlust: boolean;
}

export default locations as { [key: string]: LocationData };
