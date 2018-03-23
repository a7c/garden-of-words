import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./NavTab.css";

import ActionButton from "./ActionButton";

interface NavTabProps {
    labels: {
        label: string;
        enabled: boolean;
        hint: string;
        onHint: (hint: string) => void;
        alert?: boolean;
        clearAlert?: () => void;
    }[];
}

interface NavTabState {
    tabIndex: number;
}

export default class NavTab extends React.Component<NavTabProps, NavTabState> {
    constructor(props: NavTabProps) {
        super(props);
        this.state = { tabIndex: 0 };
    }

    changeTab = (index: number) => {
        this.setState({ tabIndex: index });
        if (this.props.labels[index] && this.props.labels[index].clearAlert) {
            this.props.labels[index].clearAlert!();
        }
    }

    render() {
        const children = this.props.children || [];
        const navbar =
            this.props.labels.map(({ label, enabled, hint, onHint, alert }, i) => (
                <ActionButton
                    className={i === this.state.tabIndex ? "active" : "inactive"}
                    key={i}
                    label={label}
                    onClick={() => this.changeTab(i)}
                    locked={!enabled}
                    alert={alert}
                    hint={hint}
                    onHint={onHint}
                />
            ));
        return (
            <section className="nav-tab">
                <nav>
                    {navbar}
                </nav>

                {children[this.state.tabIndex] || false}
            </section>
        );
    }
}
