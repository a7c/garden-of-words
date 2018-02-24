import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as model from "../model/model";
import { Question } from "../model/question";

import "../Common.css";
import "./ScenePanel.css";

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
            <section id="scene">
                <TransitionGroup>
                    <CSSTransition
                        key={index}
                        timeout={{ enter: 1000, exit: 1000 }}
                        classNames="fade"
                    >
                        <img
                            src={scenes[index]}
                        />
                    </CSSTransition>
                </TransitionGroup>
            </section>
        );
    }
}
