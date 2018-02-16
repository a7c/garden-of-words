import * as parsers from "./parsers";

const sampleEventJson = require("./collections/sample-event.json");
const events = sampleEventJson.map(parsers.parseEvent);

export default events;
