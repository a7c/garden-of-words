import * as immutable from "immutable";
import * as React from "react";
import "../Common.css";

interface LabeledPanelProps {
    id?: string;
    className?: string;
    title?: string;
}

export default class LabeledPanel extends React.Component<LabeledPanelProps> {
    render() {
        const { id, className, title } = this.props;

        let titleBar: false | JSX.Element = false;
        if (title) {
            titleBar = (
                <header>
                    <h2>{title}</h2>
                </header>
            );
        }

        return (
            <section className={"labeled-panel " + (className || "")} id={id || ""}>
                {titleBar}
                {this.props.children}
            </section>
        );
    }
}