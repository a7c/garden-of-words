import * as model from "../model/model";

const locations = require("./locations.json");

export interface PointOfInterest {
    label: string;
    eventSource: model.Location;
    flag: model.Flag;
}

export interface LocationData {
    name: string;
    pois: PointOfInterest[];
    connected: model.Location[];

    wanderlust: boolean;
}

export default locations as { [key: string]: LocationData };
