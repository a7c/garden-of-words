import * as immutable from "immutable";
import * as React from "react";

import * as model from "../model/model";

export interface StatsProps {
  resources: immutable.Map<model.Resource, number>;
}

interface StatsState {
}

export class StatsComponent extends React.Component<StatsProps, StatsState> {
    constructor(props: StatsProps) {
        super(props);

    }

    render() {

        // TODO: hardcoding in money for now
        let money = this.props.resources.get("yen");

        if (typeof money === "undefined") {
            return <span />;
        }

        return (
          <div>{`Money: ¥${money}`}</div>
        );
    }
}
