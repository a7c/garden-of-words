import * as React from "react";

interface DialogProps {
    text: string;
    style: string;
}

export default class Dialog extends React.Component<DialogProps> {
    constructor(props: DialogProps) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.style}>
                {this.props.text}
            </div>
        );
    }
}
