import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import LabeledPanel from "./LabeledPanel";

export default class EventLog extends React.Component {
    render() {
        return (
            <LabeledPanel title="Event Log" id="inventory">
                <ul>
                    <li>Here's a thing that happened.</li>
                    <li>Here's a thing that happened.</li>
                    <li>Here's a thing that happened.</li>
                    <li>Here's a thing that happened.</li>
                </ul>
            </LabeledPanel>
        );
    }
}