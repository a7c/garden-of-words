import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as model from "../model/model";

interface CollectionProps {
    collections: model.CollectionId[];
    onFinished: () => void;
}

interface CollectionState {
    showCollection: boolean;
    showedCollection: boolean;
}

export default class CollectionComponent extends React.Component<CollectionProps, CollectionState> {
    constructor(props: CollectionProps) {
        super(props);
        this.state = { showCollection: false, showedCollection: false };
        window.setTimeout(
            () => {
                this.setState({ showCollection: true });
            },
            500
        );
    }

    onExited = (node: HTMLElement) => {
        console.log("EXIT");
        if (this.state.showedCollection) {
            this.props.onFinished();
        }
    }

    render() {
        // const ev = this.props.event;
        let key = "blank";
        let contents = <span/>;
        let button = <span/>;

        if (this.state.showCollection) {
            key = "collection";
            contents = (
                <section className="Collection">
                    {this.props.collections}
                </section>
            );

            button = (
                    <button
                        onClick={() => this.setState({
                                showCollection: false,
                                showedCollection: true
                            })}
                    >
                        Continue
                    </button>
                );    
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
