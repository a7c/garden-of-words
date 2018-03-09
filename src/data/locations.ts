const locations = require("./locations.json");

export interface LocationData {
    name: string;
}

export default locations as { [key: string]: LocationData };
