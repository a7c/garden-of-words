import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./ActionButton.css";

interface Props {
    label: string;
    benefit?: string;
    cost?: string;
    locked?: boolean;
    // If paused, then something else is going on in the UI, so block
    // events from happening
    paused?: boolean;

    cooldown?: number;

    onClick?: () => void;
}

interface State {
    onCooldown: boolean;
    coolingDown: boolean;
    flashing: boolean;
}

export default class ActionButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { onCooldown: false, coolingDown: false, flashing: false };
    }

    clickHandler = () => {
        if (!this.props.paused && !this.state.onCooldown && this.props.onClick) {
            this.props.onClick();
            if (this.props.cooldown) {
                this.setState({ onCooldown: true });
                window.setTimeout(
                    () => this.setState({ coolingDown: true }),
                    100
                );
            }
        }
    }

    progressBarEnd = () => {
        this.setState({ coolingDown: false, onCooldown: false, flashing: true });
    }

    buttonEnd = () => {
        this.setState({ flashing: false });
    }

    render() {
        const cooldown =
            this.state.onCooldown ?
            (
                <div
                    onTransitionEnd={this.progressBarEnd}
                    style={{ transitionDuration: `${this.props.cooldown || 500}ms` }}
                    className={"action-button-progress" +
                         (this.state.coolingDown ?
                          " action-button-progress-countdown" : "")}
                />
            )
            : false;
        const classNames = "action-button" +
                            (this.state.flashing ? " action-button-flashing" : "");
        return (
            <button
                onAnimationEnd={this.buttonEnd}
                className={classNames}
                onClick={this.clickHandler}
                disabled={this.props.paused || this.props.locked}
            >
                {this.props.label}

                {this.props.benefit ? <span className="benefit">{this.props.benefit}</span> : false}
                {this.props.cost ? <span className="cost">{this.props.cost}</span> : false}
                {this.props.locked ?
                 <span className="action-button-lock">
                     <i className="material-icons">lock</i>
                 </span> : false}

                {cooldown}
            </button>
        );
    }
}
