import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import logger from "redux-logger";

import App from "./App";
import * as reducers from "./reducers/reducers";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

const store = createStore(
    reducers.reducer,
    // Comment/uncomment the line below to toggle logging
    applyMiddleware(logger)
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
