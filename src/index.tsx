import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import logger from "redux-logger";

import App from "./App";
import * as event from "./model/event";
import * as model from "./model/model";
import * as reducers from "./reducers/reducers";
import { parseEffect } from "./data/parsers";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

const store = createStore<model.Store>(
    reducers.reducer,
    /* Comment/uncomment the line below to toggle logging */
    applyMiddleware(logger)
);

// Dispatch any actions needed for initialization
const initEffectsJson = require("./data/init-effects.json");
const initEffects = initEffectsJson.map(parseEffect);

initEffects.forEach((effect: event.Effect) =>
    store.dispatch(effect.toAction())
);

store.subscribe(() => {
    // TODO: disable this for now and allow manual saving of games
    // (so I have a checkpoint to use)
    window.localStorage["save-game"] = store.getState().toJS();
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
