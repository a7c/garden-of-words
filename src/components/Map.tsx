import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./Map.css";

import MapComponent from "../assets/Map";

export default class Map extends React.Component {
    clickSvg = (e: React.MouseEvent<SVGElement>) => {
        if ((e.target as SVGElement).tagName === "circle") {
            console.log("You clicked a circle");
        }
    }

    render() {
        return (
            <section id="map">
                <MapComponent onClick={this.clickSvg} />
            </section>
        );
    }
}
