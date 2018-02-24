import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import LabeledPanel from "./LabeledPanel";

interface Props {
    entries: string[];
}

export default class EventLog extends React.Component<Props> {
    render() {
        const { entries } = this.props;
        return (
            <LabeledPanel title="Event Log" id="inventory">
                <ul>
                    {entries.map((entry, id) =>
                        <li key={id}>{entry}</li>)}
                </ul>
            </LabeledPanel>
        );
    }
}
