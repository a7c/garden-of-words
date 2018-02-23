import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";

import "../Common.css";
import LabeledPanel from "./LabeledPanel";
import Meter from "./Meter";

interface InventoryProps {
    resources: immutable.Map<model.Resource, number>;
}

export default class Inventory extends React.Component {
    render() {
        return (
            <div id="inventory" title="Inventory">
                <LabeledPanel title="Money" id="money-meter">
                    <div>
                        Yen
                    </div>
                    <div>
                        0
                    </div>
                </LabeledPanel>
                <LabeledPanel title="Stamina">
                    Stamina: 99/99
                </LabeledPanel>
            </div>
        );
    }
}