import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./Map.css";

import MapComponent from "../assets/Map";

export default class Map extends React.Component {
    render() {
        return (
            <section id="map">
                <MapComponent />
            </section>
        );
    }
}
