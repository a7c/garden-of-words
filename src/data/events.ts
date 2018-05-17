import * as parsers from "./parsers";

const sampleEventJson = require("./collections/sample-event.json");
const vendingEventJson = require("./collections/vending-machine-event.json");
const transliterateEventJson = require("./collections/transliterate-event.json");
const luggageEventJson = require("./collections/luggage-event.json");
const watchNewsJson = require("./collections/watch-news.json");
const airportTrainStationJson = require("./collections/train-station.json");
const ticketBoothJson = require("./collections/ticket-booth.json");
const events = sampleEventJson.map(parsers.parseEvent);

/** These may be lists of events or event pipelines */
export default {
    airportGate: events,
    airportFoodCourt: require("./collections/food-court.json").map(parsers.parseEvent),
    airportFoodCourtRamenYa: require("./collections/food-court-ramen-ya.json").map(parsers.parseEvent),
    airportFoodCourtRamenYaRed: require("./collections/food-court-ramen-ya-red.json").map(parsers.parseEvent),
    airportFoodCourtRamenYaPurple: require("./collections/food-court-ramen-ya-purple.json").map(parsers.parseEvent),
    airportFoodCourtRamenYaChef: require("./collections/food-court-ramen-ya-chef.json").map(parsers.parseEvent),
    transliterateJob: parsers.parseEventPipeline(transliterateEventJson),
    vendingMachine: vendingEventJson.map(parsers.parseEvent),
    vendingMachineGreen: require("./collections/green.json").map(parsers.parseEvent),
    vendingMachineHat: require("./collections/hat.json").map(parsers.parseEvent),
    vendingMachineMysteryHat: require("./collections/vending-mystery-hat.json").map(parsers.parseEvent),
    luggageJob: luggageEventJson.map(parsers.parseEvent),
    watchNews: watchNewsJson.map(parsers.parseEvent),
    airportTrainStation: airportTrainStationJson.map(parsers.parseEvent),
    ticketBooth: ticketBoothJson.map(parsers.parseEvent)
};
