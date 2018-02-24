import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./NavTab.css";

interface NavTabProps {
    labels: string[];
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
            this.props.labels.map((label, i) => (
                <button
                    key={i}
                    className={i === this.state.tabIndex ? "active" : "inactive"}
                    onClick={() => this.changeTab(i)}
                >
                    {label}
                </button>
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
