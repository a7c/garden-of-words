import * as React from "react";

import * as model from "../model/model";

export interface StatsProps {
  store: model.Store;
}

interface StatsState {
}

export class StatsComponent extends React.Component<StatsProps, StatsState> {
    constructor(props: StatsProps) {
        super(props);

    }

    render() {

        let money = this.props.store.resources.get({} as model.Resource);
        return (
          null
        );
    }
}
