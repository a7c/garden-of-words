import * as parsers from "./parsers";

const sampleEventJson = require("./collections/sample-event.json");
const vendingEventJson = require("./collections/vending-machine-event.json");
const transliterateEventJson = require("./collections/transliterate-event.json");
const luggageEventJson = require("./collections/luggage-event.json");
const events = sampleEventJson.map(parsers.parseEvent);

export default {
    events,
    transliterate: transliterateEventJson.map(parsers.parseEvent),
    vendingMachine: vendingEventJson.map(parsers.parseEvent),
    luggageEvent: luggageEventJson.map(parsers.parseEvent)
};
