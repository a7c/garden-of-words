import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./ActionButton.css";

interface Props {
    label: string;
    cost?: string;
    locked?: boolean;

    onClick?: () => void;
}

export default class ActionButton extends React.Component<Props> {
    clickHandler = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    render() {
        return (
            <button className="action-button" onClick={this.clickHandler}>
                {this.props.label}
                {this.props.cost ? <span>{this.props.cost}</span> : false}
            </button>
        );
    }
}
