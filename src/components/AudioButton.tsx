import * as immutable from "immutable";
import * as React from "react";
import Sound from "react-sound";

import * as model from "../model/model";
import * as lookup from "../model/lookup";

import "../Common.css";
import "./AudioButton.css";

interface Props {
    id: model.LearnableId;
}

interface State {
    playing: boolean;
}

export default class AudioButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { playing: false };
    }

    clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        this.setState({ playing: true });
    }

    onFinishedPlaying = () => {
        this.setState({ playing: false });
    }

    render() {
        const learnable = lookup.getLearnable(this.props.id);

        if (learnable.audio) {
            return (
                <button
                    className="audio-button"
                    onClick={this.clickHandler}
                >
                    <img
                        src={require("../assets/icons/speaker.png")}
                        height="32"
                        width="32"
                    />
                    <Sound
                        url={learnable.audio}
                        playStatus={this.state.playing ? Sound.status.PLAYING : Sound.status.STOPPED}
                        onFinishedPlaying={this.onFinishedPlaying}
                    />
                </button>
            );
        }

        return null;
    }
}
