import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";

import "../Common.css";
import "./Inventory.css";

import LabeledPanel from "./LabeledPanel";
import Meter from "./Meter";

interface Props {
    resources: immutable.Map<model.Resource, number>;
}

export default class Inventory extends React.Component<Props> {
    render() {
        const { resources } = this.props;

        return (
            <div id="inventory" title="Inventory">
                <LabeledPanel title="Money" id="money-meter">
                    <div>
                        Yen
                    </div>
                    <div>
                        {resources.get("yen") || 0}
                    </div>
                </LabeledPanel>
                <LabeledPanel title="Stamina">
                    Stamina: 99/99
                </LabeledPanel>
            </div>
        );
    }
}
