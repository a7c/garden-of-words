import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./NavTab.css";

import ActionButton from "./ActionButton";

interface NavTabProps {
    labels: [string, boolean][];
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
    }

    render() {
        const children = this.props.children || [];
        const navbar =
            this.props.labels.map(([ label, enabled ], i) => (
                <ActionButton
                    className={i === this.state.tabIndex ? "active" : "inactive"}
                    key={i}
                    label={label}
                    onClick={() => this.changeTab(i)}
                    locked={!enabled}
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
