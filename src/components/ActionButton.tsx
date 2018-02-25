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

    onClick?: () => void;
}

export default class ActionButton extends React.Component<Props> {
    clickHandler = () => {
        if (!this.props.paused && this.props.onClick) {
            this.props.onClick();
        }
    }

    render() {
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
            </button>
        );
    }
}
