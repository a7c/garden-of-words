import * as parsers from "./parsers";

const sampleEventJson = require("./collections/sample-event.json");
const vendingEventJson = require("./collections/vending-machine-event.json");
const events = sampleEventJson.map(parsers.parseEvent);

export default {
    events,
    vendingMachine: vendingEventJson.map(parsers.parseEvent),
};
