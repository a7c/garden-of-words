import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./ActionButton.css";

interface Props {
    label?: string;
    benefit?: string;
    cost?: string;
    locked?: boolean;
    // If paused, then something else is going on in the UI, so block
    // events from happening
    paused?: boolean;
    hint?: string;
    cooldown?: number;
    className?: string;
    alert?: boolean;

    onClick?: () => void;
    onPaused?: () => void;
    onHint?: (hint: string) => void;
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

    componentWillUpdate(nextProps: Props, nextState: State) {
        // Don't set cooldown until pause ends
        if (nextState.onCooldown && !nextState.coolingDown) {
            if (!nextProps.paused) {
                setTimeout(() => this.setState({ coolingDown: true }), 100);
                setTimeout(
                    () => this.setState({ coolingDown: false, onCooldown: false, flashing: true }),
                    100 + this.props.cooldown!
                );
            }
        }
    }

    clickHandler = () => {
        if (this.props.paused || this.props.locked) {
            if (this.props.onPaused) {
                this.props.onPaused();
            }
            else if (this.props.locked && this.props.onHint && this.props.hint) {
                this.props.onHint(this.props.hint);
            }

            return;
        }
        if (!this.state.onCooldown && this.props.onClick) {
            this.props.onClick();
            if (this.props.cooldown) {
                this.setState({ onCooldown: true });
            }
        }
    }

    buttonEnd = () => {
        this.setState({ flashing: false });
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
        const classNames = "action-button" +
                             (this.props.className ? ` ${this.props.className}` : "") +
                             (this.state.flashing ? " action-button-flashing" : "") +
                             ((this.props.paused || this.props.locked) ? " action-button-disabled" : "");
        return (
            <button
                onAnimationEnd={this.buttonEnd}
                className={classNames}
                onClick={this.clickHandler}
                title={this.props.locked ? this.props.hint : undefined}
            >
                {this.props.label || this.props.children}

                <div className="action-button-annotations">
                    {this.props.benefit ? <span className="benefit">{this.props.benefit}</span> : false}
                    {this.props.cost ? <span className="cost">{this.props.cost}</span> : false}
                    {this.props.locked ?
                     <span className="action-button-lock">
                         <i className="material-icons">lock</i>
                     </span> : false}
                    {this.props.alert ?
                     <span className="action-button-lock action-button-error">
                         <i className="material-icons">error</i>
                     </span> : false}
                </div>

                {cooldown}
            </button>
        );
    }
}
