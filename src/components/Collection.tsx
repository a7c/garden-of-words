import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as model from "../model/model";

import "../Common.css";
import "./Collection.css";

import * as lookup from "../model/lookup";

import ActionButton from "./ActionButton";

export interface CollectionProps {
    name: string;
    exists: string[];
    encountered: model.Collection;
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

    onExited = () => {
        if (this.state.showedCollection) {
            this.props.onFinished();
        }
    }

    itemOnClick = (id: model.LearnableId) => {
        const word = this.props.learned.get(id);
        if (word !== null && word.item !== null) {
            const learnable = lookup.getLearnable(word.item);
            alert(`${learnable.front} ${learnable.back}\nscore: ${word.score}`);
        }
    }

    render() {
        let contents = [<span key="blank"/>];
        let header = <span/>;
        let key = "blank";
        if (this.state.showCollection) {
            key = "notblank";

            header = (
                <ActionButton
                    onClick={() => this.setState({
                      showCollection: false,
                      showedCollection: true
                    })}
                    label={this.props.name}
                />
            );

            let isLocked = (id: string) => {
                if (this.props.encountered) {
                    return !this.props.encountered.has(id);
                } else {
                    return true;
                }
            };

            // set contents
            contents = this.props.exists.map((id) => {
                    if (id !== undefined) {
                        return (
                            <ActionButton
                                label={lookup.getLearnable(id).front}
                                locked={isLocked(id)}
                                onClick={() => this.itemOnClick(id)}
                            />
                        );
                    }
                    else {
                        return <span key="blank"/>;
                    }
                });
        }

        return (
            <TransitionGroup>
                <CSSTransition
                    key={key}
                    timeout={{ enter: 1000, exit: 800 }}
                    classNames="fade"
                    onExited={this.onExited}
                >
                    <section className="collection-display">
                        <div id="collections-header">
                        {header}
                        </div>
                        {contents}
                    </section>
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
