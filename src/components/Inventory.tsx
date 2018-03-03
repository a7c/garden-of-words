import * as immutable from "immutable";
import * as React from "react";

/// <reference path="../untypedDeps.d.ts" />
import AnimatedNumber from "react-animated-number";

import * as model from "../model/model";

import "../Common.css";
import "./Inventory.css";

import LabeledPanel from "./LabeledPanel";
import Meter from "./Meter";

interface Props {
    resources: immutable.Map<model.Resource, model.ResourceProps>;
}

export default class Inventory extends React.Component<Props> {
    render() {
        const { resources } = this.props;

        const currentYen = (resources.get("yen")) ? resources.get("yen").currentValue : 0;
        const currentStamina = (resources.get("stamina")) ? resources.get("stamina").currentValue : 0;
        const maxStamina = (resources.get("stamina")) ? resources.get("stamina").maxValue : 0;

        return (
            <div id="inventory" title="Inventory">
                <LabeledPanel title="Money" id="money-meter">
                    <div>¥</div>
                    <div>
                        <AnimatedNumber value={currentYen} duration={200} stepPrecision={0} />
                    </div>
                </LabeledPanel>
                <LabeledPanel title="Stamina">
                    Stamina:
                        <AnimatedNumber value={currentStamina} duration={200} stepPrecision={0} />/
                        <AnimatedNumber value={maxStamina} duration={200} stepPrecision={0} />
                </LabeledPanel>
            </div>
        );
    }
}
