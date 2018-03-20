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
    encountered: model.Collection;
    learned: immutable.Map<model.LearnableId, model.Learned>;
    onFinished: () => void;
}

interface CollectionState {
    showCollection: boolean;
    showedCollection: boolean;

    expandedId: model.LearnableId | null;
}

export default class CollectionComponent extends React.Component<CollectionProps, CollectionState> {
    constructor(props: CollectionProps) {
        super(props);
        this.state = { showCollection: false, showedCollection: false, expandedId: null };
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
        if (this.state.expandedId === id) {
            this.setState({ expandedId: null });
        }
        else {
            this.setState({ expandedId: id });
        }
        const word = this.props.learned.get(id);
        if (word && word.item) {
            const learnable = lookup.getLearnable(word.item);
            /* alert(`${learnable.front} ${learnable.back}\nscore: ${word.score}`);*/
        }
    }

    render() {
        const collection = lookup.getCollection(this.props.name);
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
                >
                    <span className="collection-title">{collection.name}</span>
                    {collection.subtitle ? <span className="collection-subtitle">{collection.subtitle}</span> : false}
                    <span className="collection-learned-count">
                        {this.props.encountered ?
                         this.props.encountered.size : 0}
                    </span>
                    <span className="collection-count-frac" />
                    <span className="collection-count">{collection.learnables.length}</span>
                </ActionButton>
            );

            const isLocked = (id: string) => {
                if (this.props.encountered) {
                    return !this.props.encountered.has(id);
                } else {
                    return true;
                }
            };

            // Collate learnables by their parent ID
            const groupedLearnables: { [parentId: string]: {
                items: model.Learnable[];
                learned: boolean;
            } } = {};
            for (const id of collection.learnables) {
                const learnable = lookup.getLearnable(id);
                const canonicalId = learnable.parentId || learnable.id;
                if (!groupedLearnables[canonicalId]) {
                    groupedLearnables[canonicalId] = { items: [], learned: false };
                }
                groupedLearnables[canonicalId].items.push(learnable);
                groupedLearnables[canonicalId].learned = !isLocked(id);
            }

            const keys = Object.keys(groupedLearnables);
            keys.sort((k1, k2) => k1.localeCompare(k2));

            contents = keys.map((id) => {
                const record = groupedLearnables[id];
                return (
                    <ActionButton
                        className={id === this.state.expandedId ? "collection-item-expanded" : ""}
                        key={id}
                        locked={!record.learned}
                        onClick={() => this.itemOnClick(id)}
                    >
                        <span className="collection-item-title">{lookup.getLearnable(id).front}</span>
                        <span className="collection-item-subtitle">{lookup.getLearnable(id).back}</span>
                        <div className="collection-item-detail">
                            {groupedLearnables[id].items.map((learnable) => {
                                 if (!isLocked(learnable.id)) {
                                     return (
                                         <p>
                                             {learnable.front} = {learnable.back}&nbsp;
                                             Score: {this.props.learned.get(learnable.id).score}
                                         </p>
                                     );
                                 }
                                 return false;
                             })}
                        </div>
                    </ActionButton>
                );
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
                        <div id="collection-header">
                            {header}
                        </div>
                        <div id="collection-body">
                            {contents}
                        </div>
                    </section>
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
