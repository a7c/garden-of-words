import * as React from "react";

import * as model from "../model/model";

interface ArtPanelProps {
    location: model.Location;
}

interface ArtPanelState {

}

export default class ArtPanel extends React.Component<ArtPanelProps, ArtPanelState> {
    constructor(props: ArtPanelProps) {
        super(props);
    }

    render() {
        return <div><img src={require("../assets/bg01a.png")} /></div>;
    }
}