import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
/// <reference path="./untypedDeps.d.ts" />
import * as transit from "transit-immutable-js";
import logger from "redux-logger";

import App from "./App";
import * as actions from "./actions/actions";
import * as event from "./model/event";
import * as model from "./model/model";
import * as reducers from "./reducers/reducers";
import { parseEffect } from "./data/parsers";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

const store = createStore<model.Store>(
    reducers.reducer,
    /* Comment/uncomment the line below to toggle logging */
    // applyMiddleware(logger)
);

// Dispatch any actions needed for initialization
const initEffectsJson = require("./data/init-effects.json");
const initEffects = initEffectsJson.map(parseEffect);

const persistence = transit.withRecords([
    model.LearnedRecord,
    model.Learned,
    model.LocationRecord,
    model.WardrobeRecord,
    model.Store,
]);

store.subscribe(() => {
    window.localStorage["save-state"] = persistence.toJSON(store.getState());
});

let gameLoaded = false;
if (window.localStorage["save-state"]) {
    try {
        const savedGame = persistence.fromJSON(window.localStorage["save-state"]);
        store.dispatch(actions.load(savedGame));
        gameLoaded = true;
    }
    catch (e) {
        console.warn("Could not load save game!");
        console.warn(e);
    }
}

if (!gameLoaded) {
    initEffects.forEach((effect: event.Effect) =>
        store.dispatch(effect.toAction())
    );
}

// See App#componentDidMount
(window as any).gameLoaded = gameLoaded; //tslint:disable-line

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
