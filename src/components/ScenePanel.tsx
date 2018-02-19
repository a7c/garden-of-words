import * as React from "react";

import * as model from "../model/model";

interface ScenePanelProps {
    location: model.Location;
}

interface ScenePanelState {

}

export default class ScenePanel extends React.Component<ScenePanelProps, ScenePanelState> {
    constructor(props: ScenePanelProps) {
        super(props);
    }

    render() {
        return (
            <div style={{ float: "left" }}>
                <img src={require("../assets/bg01a.png")} />
            </div>
        );
    }
}