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

    render() {
        let contents = <span/>;
        let key = "not-shown";
        if (this.state.showed) {
            key = "showed";
        }
        else if (this.state.show) {
            key = "showing";
            contents = React.cloneElement(this.props.children as any, { exit: this.exit }); //tslint:disable-line
        }

        return (
            <TransitionGroup>
                <CSSTransition
                    key={key}
                    timeout={{ enter: 500, exit: 400 }}
                    classNames="fade"
                    onExited={this.onExited}
                >
                    <div>
                        {contents}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
