import * as parsers from "./parsers";

const sampleEventJson = require("./collections/sample-event.json");
const vendingEventJson = require("./collections/vending-machine-event.json");
const transliterateEventJson = require("./collections/transliterate-event.json");
const luggageEventJson = require("./collections/luggage-event.json");
const watchNewsJson = require("./collections/watch-news.json");
const airportTrainStationJson = require("./collections/train-station.json");
const ticketBoothJson = require("./collections/ticket-booth.json");
const events = sampleEventJson.map(parsers.parseEvent);

export default {
    airportGate: events,
    airportFoodCourt: require("./collections/food-court.json").map(parsers.parseEvent),
    airportFoodCourtRamenYa: require("./collections/food-court-ramen-ya.json").map(parsers.parseEvent),
    airportFoodCourtRamenYaBlue: require("./collections/food-court-ramen-ya-blue.json").map(parsers.parseEvent),
    airportFoodCourtRamenYaGreen: require("./collections/food-court-ramen-ya-green.json").map(parsers.parseEvent),
    transliterateJob: transliterateEventJson.map(parsers.parseEvent),
    vendingMachine: vendingEventJson.map(parsers.parseEvent),
    luggageJob: luggageEventJson.map(parsers.parseEvent),
    watchNews: watchNewsJson.map(parsers.parseEvent),
    airportTrainStation: airportTrainStationJson.map(parsers.parseEvent),
    ticketBooth: ticketBoothJson.map(parsers.parseEvent)
};
