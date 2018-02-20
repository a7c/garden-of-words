import * as React from "react";

import * as model from "../model/model";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "../Common.css";

interface ScenePanelProps {
    location: model.Location;
}

interface ScenePanelState {
    sceneIndex: number;
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
        this.state = {
            sceneIndex: 0
        };
    }

    _onClick = () => {
        this.setState({
            sceneIndex: (this.state.sceneIndex + 1) % scenes.length
        });
    }

    render() {
        const { sceneIndex } = this.state;
        
        return (
            <div style={{ float: "left" }} onClick={this._onClick} >
                <TransitionGroup>
                    <CSSTransition
                        key={sceneIndex}
                        timeout={{ enter: 1000, exit: 1000 }}
                        classNames="fade"
                    >
                        <img 
                            style={{ float: "left" , position: "absolute"}} 
                            src={scenes[sceneIndex]} 
                        />
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }
}