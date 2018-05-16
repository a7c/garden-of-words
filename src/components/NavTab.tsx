import * as immutable from "immutable";
import * as React from "react";

import "../Common.css";
import "./NavTab.css";

import Router from "../router";
import ActionButton from "./ActionButton";

interface NavTabProps {
    labels: {
        label: string;
        url: string;
        enabled: boolean;
        visible: boolean;
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

    componentDidMount() {
        Router.listen(0, (path) => {
            let i = 0;
            for (const { url } of this.props.labels) {
                if (path === url) {
                    this.changeTab(i);
                    break;
                }
                i++;
            }
        });
    }

    changeTab = (index: number) => {
        Router.navigate([ this.props.labels[index]!.url ], false);
        this.setState({ tabIndex: index });
        if (this.props.labels[index] && this.props.labels[index].clearAlert) {
            this.props.labels[index].clearAlert!();
        }
    }

    render() {
        const children = this.props.children || [];
        const navbar =
            this.props.labels.map(({ label, enabled, visible, hint, onHint, alert }, i) => visible ? (
                <ActionButton
                    className={i === this.state.tabIndex ? "active" : "inactive"}
                    key={i}
                    label={label}
                    onClick={() => this.changeTab(i)}
                    locked={!enabled && i !== this.state.tabIndex}
                    alert={alert}
                    hint={hint}
                    onHint={onHint}
                />
            ) : false);
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
