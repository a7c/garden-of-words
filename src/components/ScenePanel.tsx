import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as model from "../model/model";
import { Question } from "../model/question";
import locations from "../data/locations";

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
    "arrival-departure-board": [
        require("../assets/structures/arrival-departure-board0.png"),
        require("../assets/structures/arrival-departure-board1.png"),
        require("../assets/structures/arrival-departure-board2.png")
    ],
    "baggage-claim": [
        require("../assets/structures/baggage-claim0.png"),
        require("../assets/structures/baggage-claim1.png"),
        require("../assets/structures/baggage-claim2.png")
    ],
    blank: [
        require("../assets/structures/blank0.png"),
        require("../assets/structures/blank1.png"),
        require("../assets/structures/blank2.png")
    ],
    "checkin-desk": [
        require("../assets/structures/checkin-desk0.png"),
        require("../assets/structures/checkin-desk1.png"),
        require("../assets/structures/checkin-desk2.png")
    ],
    "food-court-ramen": [
        require("../assets/structures/food-court-ramen0.png"),
        require("../assets/structures/food-court-ramen1.png"),
        require("../assets/structures/food-court-ramen2.png")
    ],
    "vending-machine-indoors": [
        require("../assets/structures/vending-machine-indoors0.png"),
        require("../assets/structures/vending-machine-indoors1.png"),
        require("../assets/structures/vending-machine-indoors2.png")
    ],
    // TODO: factor these "scenes" out somewhere different?
    vendclose: [
        require("../assets/scenes/vendclose.png")
    ],
    escalator: [
        require("../assets/structures/escalator0.png"),
        require("../assets/structures/escalator1.png"),
        require("../assets/structures/escalator2.png")
    ]
};

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
        const { location, steps } = this.props;

        const locationData = locations[location];
        const structures = locationData.structures;
        const index = steps % structures.length;

        let scene = null;
        if (locationData.wanderlust) {
            scene = (
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
            );
        }
        else {
            scene = (
                <div>
                    {/* TODO: handle no-wander areas differently/ */}
                    <img
                        src={imagesOfStructure[structures[0]][0]}
                    />
                    <img
                        src={player}
                    />
                </div>
            );
        }

        return (
            <section id="scene">
                <TransitionGroup>
                    <CSSTransition
                        key={index}
                        timeout={{ enter: 1000, exit: 1000 }}
                        classNames="fade"
                    >
                        {scene}
                    </CSSTransition>
                </TransitionGroup>
            </section>
        );
    }
}
