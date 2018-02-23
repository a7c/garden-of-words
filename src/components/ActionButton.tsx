import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";

interface Props {
    label: string;
    cost?: string;
    locked?: boolean;
}

export default class ActionButton extends React.Component<Props> {
    render() {
        return (
            <button className="actionButton">
                {this.props.label}
                {this.props.cost ? <span>{this.props.cost}</span> : false}
            </button>
        );
    }
}