import * as React from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as model from "../model/model";
import { Question } from "../model/question";
import * as locations from "../data/locations";

import "../Common.css";
import "./ScenePanel.css";

interface ScenePanelProps {
    store: model.Store;
    steps: number;
}

interface ScenePanelState {
    prevLocation: model.Location;
}

// TODO: need a better way of managing scene assets
const filepath = "../assets/structures";

const imagesOfStructure = {
    "arrival-departure-board": [
        require("../assets/structures/arrival-departure-board0.png"),
        require("../assets/structures/arrival-departure-board1.png"),
        require("../assets/structures/arrival-departure-board2.png")
    ],
    "baggage-carousel": [
        require("../assets/structures/baggage-carousel0.png"),
        require("../assets/structures/baggage-carousel1.png"),
        require("../assets/structures/baggage-carousel2.png")
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
    "food-court-bakery": [
        require("../assets/structures/food-court-bakery0.png"),
        require("../assets/structures/food-court-bakery1.png"),
        require("../assets/structures/food-court-bakery2.png")
    ],
    "food-court-chairs": [
        require("../assets/structures/food-court-chairs0.png"),
        require("../assets/structures/food-court-chairs1.png"),
        require("../assets/structures/food-court-chairs2.png")
    ],
    "food-court-ramen": [
        require("../assets/structures/food-court-ramen0.png"),
        require("../assets/structures/food-court-ramen1.png"),
        require("../assets/structures/food-court-ramen2.png")
    ],
    "subway-gate": [
        require("../assets/structures/subway-gate0.png"),
        require("../assets/structures/subway-gate1.png"),
        require("../assets/structures/subway-gate2.png")
    ],
    "subway-pillar": [
        require("../assets/structures/subway-pillar0.png"),
        require("../assets/structures/subway-pillar1.png"),
        require("../assets/structures/subway-pillar2.png")
    ],
    "subway-stairs": [
        require("../assets/structures/subway-stairs0.png"),
        require("../assets/structures/subway-stairs1.png"),
        require("../assets/structures/subway-stairs2.png")
    ],
    "subway-ticketmachine": [
        require("../assets/structures/subway-ticketmachine0.png"),
        require("../assets/structures/subway-ticketmachine1.png"),
        require("../assets/structures/subway-ticketmachine2.png")
    ],
    "subway-ticketmachine-front": [
        require("../assets/scenes/subway-ticketmachine-front.png")
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
    "food-court-ramen-front": [
        require("../assets/scenes/food-court-ramen-front.png")
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

const hats = {
    "cap": require("../assets/hats/cap.png"),
    "fedora": require("../assets/hats/fedora.png"),
    "odango-atama": require("../assets/hats/odango-atama.png"),
    "ribbon": require("../assets/hats/ribbon.png"),
    "hitai-ate": require("../assets/hats/spy-from-disguised-leaf-city.png"),
    "witch-hat": require("../assets/hats/witch.png")
};

export default class ScenePanel extends React.Component<ScenePanelProps, ScenePanelState> {
    constructor(props: ScenePanelProps) {
        super(props);
        this.state = { prevLocation: props.store.location.current };
    }

    render() {
        const { steps, store } = this.props;
        const location = store.location.current;

        const newLocation = location !== this.state.prevLocation;

        const locationData = locations.getLocation(location);
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
                </div>
            );
        }

        const currentHat = store.wardrobe.currentHat;

        const timeout = newLocation ? { enter: 2400, exit: 2400 }
                      : { enter: 500, exit: 500 };
        const transitionClass = newLocation ? "slowfade" : "fade";
        return (
            <section id="scene">
                <TransitionGroup>
                    <CSSTransition
                        key={index}
                        timeout={timeout}
                        classNames={transitionClass}
                        onEntered={() => this.setState({ prevLocation: location })}
                    >
                        {scene}
                    </CSSTransition>
                </TransitionGroup>
                <img
                    className={newLocation ? "bobbing" : ""}
                    src={currentHat !== null ? hats[currentHat] : player}
                />
            </section>
        );
    }
}
