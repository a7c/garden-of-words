import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as event from "../model/event";
import * as model from "../model/model";

interface EventProps {
    event: event.Event;
    onFinished: () => void;
}

interface FlavorProps {
    event: event.FlavorEvent;
}

interface EventState {
    showEvent: boolean;
    showedEvent: boolean;
}

class Flavor extends React.Component<FlavorProps> {
    render() {
        return (
            <section className="Event">
                {this.props.event.flavor}
            </section>
        );
    }
}

export default class EventComponent extends React.Component<EventProps, EventState> {
    constructor(props: EventProps) {
        super(props);
        this.state = { showEvent: false, showedEvent: false };
        window.setTimeout(
            () => {
                this.setState({ showEvent: true });
            },
            500
        );
    }

    onExited = (node: HTMLElement) => {
        if (this.state.showedEvent) {
            this.props.onFinished();
        }
    }

    render() {
        const ev = this.props.event;
        let contents = <span/>;
        let button = <span/>;
        let key = "blank";
        if (this.state.showEvent) {
            button = (
                <button
                    onClick={() => this.setState({
                            showEvent: false,
                            showedEvent: true
                        })}
                >
                    Continue
                </button>
            );
            if (ev instanceof event.FlavorEvent) {
                contents = <Flavor key="flavor" event={ev} />;
                key = "flavor";
            }
            else {
                contents = <p key="error">Unsupported event!</p>;
                key = "error";
            }
        }

        return (
            <TransitionGroup>
                <CSSTransition
                    key={key}
                    timeout={{ enter: 1000, exit: 800 }}
                    classNames="fade"
                    onExited={this.onExited}
                >
                    <div>
                        {contents}
                        {button}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
