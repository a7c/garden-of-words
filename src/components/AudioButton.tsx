import * as immutable from "immutable";
import * as React from "react";
import Sound from "react-sound";

import * as model from "../model/model";
import * as lookup from "../model/lookup";

import "../Common.css";
import "./AudioButton.css";

interface Props {
    collectionId: model.CollectionId;
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
        const { collectionId, id } = this.props;

        // if ()

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
                    url={`audio/${collectionId}/${id}.mp3`}
                    playStatus={this.state.playing ? Sound.status.PLAYING : Sound.status.STOPPED}
                    onFinishedPlaying={this.onFinishedPlaying}
                />
            </button>

        );

    }
}
