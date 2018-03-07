import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./Map.css";

export default class Map extends React.Component {
    render() {
        return (
            <section id="map">
                <object data={require("../assets/map.svg")} type="image/svg+xml" />
            </section>
        );
    }
}
