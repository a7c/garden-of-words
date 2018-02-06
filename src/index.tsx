import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";

import App from "./App";
import * as reducers from "./reducers/reducers";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

const store = createStore(reducers.reducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
