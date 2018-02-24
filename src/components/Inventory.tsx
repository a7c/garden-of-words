declare module "react-countup";

import * as immutable from "immutable";
import * as React from "react";

import CountUp from "react-countup";

import * as model from "../model/model";

import "../Common.css";
import "./Inventory.css";

import LabeledPanel from "./LabeledPanel";
import Meter from "./Meter";

interface Props {
    resources: immutable.Map<model.Resource, number>;
}

export default class Inventory extends React.Component<Props> {
    prevYen: number;

    constructor(props: Props) {
        super(props);
        this.prevYen = 0;
    }

    render() {
        const { resources } = this.props;

        const prevYen = this.prevYen;
        this.prevYen = resources.get("yen") || 0;

        return (
            <div id="inventory" title="Inventory">
                <LabeledPanel title="Money" id="money-meter">
                    <div>
                        Yen
                    </div>
                    <div>
                        <CountUp start={prevYen} end={resources.get("yen") || 0} duration={1} />
                    </div>
                </LabeledPanel>
                <LabeledPanel title="Stamina">
                    Stamina: 99/99
                </LabeledPanel>
            </div>
        );
    }
}
