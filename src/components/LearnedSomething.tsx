import * as React from "react";
import "../Common.css";
import * as model from "../model/model";

import Fade from "./Fade";

interface Props {
    learnable: model.Learnable;
    onFinished: () => void;
}

export default class LearnedSomething extends React.Component<Props> {
    fade: Fade | null;

    constructor(props: Props) {
        super(props);
        this.fade = null;
    }

    render() {
        const { learnable, onFinished } = this.props;
        const button = (
            <button
                onClick={() => this.fade ? this.fade.exit() : null}
            >
                Continue
            </button>
        );

        return (
            <Fade onFinished={onFinished} ref={f => (this.fade = f)}>
                <div className="PopupBox">
                    <p>You learned {learnable.unicode} ({learnable.romaji})!</p>
                    {button}
                </div>
            </Fade>
        );
    }
}
