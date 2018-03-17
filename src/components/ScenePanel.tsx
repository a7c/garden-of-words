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
const filepath = "../assets/structures";

const imagesOfStructure = {
    blank: [
        require("../assets/structures/blank0.png"),
        require("../assets/structures/blank1.png"),
        require("../assets/structures/blank2.png")
    ],
    vendin: [
        require("../assets/structures/vendin0.png"),
        require("../assets/structures/vendin1.png"),
        require("../assets/structures/vendin2.png")
    ],
};

const structures = [
    "blank",
    "blank",
    "vendin"
];

const bg = require("../assets/bg/bg.png");

const people = [
    require("../assets/people/crowd0.png"),
    require("../assets/people/crowd1.png"),
    require("../assets/people/crowd2.png")
];

const player = require("../assets/player/player.png");

export default class ScenePanel extends React.Component<ScenePanelProps, ScenePanelState> {
    constructor(props: ScenePanelProps) {
        super(props);
    }

    render() {
        const { steps } = this.props;

        const index = steps % structures.length;

        return (
            <section id="scene">
                <TransitionGroup>
                    <CSSTransition
                        key={index}
                        timeout={{ enter: 1000, exit: 1000 }}
                        classNames="fade"
                    >
                        <div>
                            {/* Background */}
                            <img
                                src={bg}
                            />
                            {/* Far */}
                            <img
                                src={imagesOfStructure[structures[(index + 2) % structures.length]][0]}
                            />
                            {/* Med */}
                            <img
                                src={imagesOfStructure[structures[(index + 1) % structures.length]][1]}
                            />
                            {/* Near */}
                            <img
                                src={imagesOfStructure[structures[index]][2]}
                            />
                            {/* People */}
                            <img
                                src={people[index]}
                            />
                            {/* Player */}
                            <img
                                src={player}
                            />
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </section>
        );
    }
}
