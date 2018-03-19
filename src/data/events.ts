import * as parsers from "./parsers";

const sampleEventJson = require("./collections/sample-event.json");
const vendingEventJson = require("./collections/vending-machine-event.json");
const transliterateEventJson = require("./collections/transliterate-event.json");
const luggageEventJson = require("./collections/luggage-event.json");
const events = sampleEventJson.map(parsers.parseEvent);

export default {
    airportGate: events,
    airportFoodCourt: events,
    transliterateJob: transliterateEventJson.map(parsers.parseEvent),
    vendingMachine: vendingEventJson.map(parsers.parseEvent),
    luggageJob: luggageEventJson.map(parsers.parseEvent)
};
