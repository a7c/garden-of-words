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
}

export default class ActionButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { onCooldown: false, coolingDown: false };
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
                window.setTimeout(
                    () => this.setState({ coolingDown: false, onCooldown: false }),
                    100 + this.props.cooldown
                );
            }
        }
    }

    render() {
        const cooldown =
            this.state.onCooldown ?
            (
                <div
                    style={{ transitionDuration: `${this.props.cooldown || 500}ms` }}
                    className={"action-button-progress" +
                         (this.state.coolingDown ?
                          " action-button-progress-countdown" : "")}
                />
            )
            : false;
        return (
            <button
                className="action-button"
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
