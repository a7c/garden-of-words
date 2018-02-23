import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as event from "../model/event";
import * as model from "../model/model";

import { hiraganaBasicDict } from "../model/kana";

export interface CollectionProps {
    collection: model.Collection;
    learned: immutable.Map<model.LearnableId, model.Learned>;

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
        if (this.state.showedCollection) {
            this.props.onFinished();
        }
    }

    itemOnClick = (id: model.LearnableId) => {
        const word = this.props.learned.get(id);
        if (word !== null && word.item !== null) {
            alert(`${word.item.unicode} ${word.item.romaji}\nscore: ${word.score}`);
        }
    }

    render() {
        const col = this.props.collection;
        let contents = [<span key="blank"/>];
        let button = <span/>;
        let key = "blank";
        if (this.state.showCollection) {
            key = "notblank";
            // set contents
            contents = col.map((id) => {
                    if (id !== undefined) {
                        return (
                            <button className="Button" key={id} onClick={() => this.itemOnClick(id)} >
                                {hiraganaBasicDict.get(id).unicode}
                            </button>
                        );
                    }
                    else {
                        return <span key="blank"/>;
                    }
                }).toArray();

            button = (
                <button
                    className="Button"
                    onClick={() => this.setState({
                            showCollection: false,
                            showedCollection: true
                        })}
                >
                    Back
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
