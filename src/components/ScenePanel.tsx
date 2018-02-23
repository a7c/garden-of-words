import * as React from "react";

import * as model from "../model/model";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "../Common.css";

interface ScenePanelProps {
    location: model.Location;
    steps: number;
}

interface ScenePanelState {

}

// TODO: need a better way of managing scene assets
const scenes = [
    require("../assets/bg01a.png"),
    require("../assets/bg02a.png"),
    require("../assets/bg03a.png")
];

export default class ScenePanel extends React.Component<ScenePanelProps, ScenePanelState> {
    constructor(props: ScenePanelProps) {
        super(props);

    }

    render() {
        const { steps } = this.props;

        const index = steps % scenes.length;

        return (
            <div style={{ float: "left" }} >
                <TransitionGroup>
                    <CSSTransition
                        key={index}
                        timeout={{ enter: 1000, exit: 1000 }}
                        classNames="fade"
                    >
                        <img
                            style={{ float: "left" , position: "absolute"}}
                            src={scenes[index]}
                        />
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }
}