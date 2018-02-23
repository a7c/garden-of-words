import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./ActionPanel.css";

import ActionButton from "./ActionButton";
import LabeledPanel from "./LabeledPanel";

export default class ActionPanel extends React.Component {
    render() {
        return (
            <LabeledPanel title="Actions" id="actions">
                <div>
                    <ActionButton label="Wander" />
                    <ActionButton label="Meditate" />
                    <ActionButton label="Transliterate" cost="+5 YEN" />
                </div>

                <div>
                    <ActionButton label="Vending Machine" />
                </div>

                <div>
                    <ActionButton label="Subway" />
                </div>
            </LabeledPanel>
        );
    }
}