import * as immutable from "immutable";
import * as React from "react";
import "../Common.css";

export default class Map extends React.Component {
    render() {
        return (
            <section id="map">
                <img src={require("../assets/map.svg")} />
            </section>
        );
    }
}
