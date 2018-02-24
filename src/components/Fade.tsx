import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";

interface FadeProps {
    onFinished: () => void;
}

interface FadeState {
    show: boolean;
    showed: boolean;
}

export default class Fade extends React.Component<FadeProps, FadeState> {
    constructor(props: FadeProps) {
        super(props);
        this.state = { show: false, showed: false };
    }

    componentDidMount() {
        this.setState({ show: true });
    }

    onExited = (node: HTMLElement) => {
        if (this.state.showed) {
            this.props.onFinished();
        }
    }

    exit = () => {
        this.setState({ showed: true });
    }

    delayedExit() {
        window.setTimeout(
            () => {
                this.exit();
            },
            1000
        );
    }

    render() {
        let contents = <span/>;
        let key = "not-shown";
        if (this.state.showed) {
            key = "showed";
        }
        else if (this.state.show) {
            key = "showing";
            contents = <div>{this.props.children}</div>;
        }

        return (
            <TransitionGroup>
                <CSSTransition
                    key={key}
                    timeout={{ enter: 500, exit: 400 }}
                    classNames="fade"
                    onExited={this.onExited}
                >
                    {contents}
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
