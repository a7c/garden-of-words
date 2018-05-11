import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as event from "../model/event";
import * as model from "../model/model";

import "../Common.css";
import "./Collection.css";

import * as lookup from "../model/lookup";

import ActionButton from "./ActionButton";
import AudioButton from "./AudioButton";

export interface CollectionProps {
    name: string;
    encountered: model.Collection;
    learned: immutable.Map<model.LearnableId, model.Learned>;
    searchTerm: string | null;
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
        }
    }

    render() {
        const collection = lookup.getCollection(this.props.name);
        let contents = [<span key="blank"/>];
        let header = <span/>;
        let key = "blank";

        if (this.state.showCollection) {
            key = "notblank";

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
                groupedLearnables[canonicalId].learned = groupedLearnables[canonicalId].learned ||
                                                         !isLocked(id);
            }

            const keys = Object.keys(groupedLearnables);
            keys.sort((k1, k2) => k1.localeCompare(k2));

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
                        {Object.keys(groupedLearnables).filter(k => groupedLearnables[k].learned).length}
                    </span>
                    <span className="collection-count-frac" />
                    <span className="collection-count">{Object.keys(groupedLearnables).length}</span>
                </ActionButton>
            );

            const maybeContents = keys.map((id) => {
                const record = groupedLearnables[id];
                let score = 0;
                for (const item of record.items) {
                    const learnedRecord = this.props.learned.get(item.id);
                    score += learnedRecord ? ((learnedRecord.score / 100) / record.items.length) : 0;
                }
                score = 100 * (1 - score);

                if (this.props.searchTerm !== null) {
                    if (!record.items.some((item) => {
                        const learnable = lookup.getLearnable(item.id);
                        return learnable.front.indexOf(this.props.searchTerm!) >= 0 ||
                               learnable.back.indexOf(this.props.searchTerm!) >= 0;
                    })) {
                        return null;
                    }
                }

                const classes = [ "collection-item" ];
                if (id === this.state.expandedId) {
                    classes.push("collection-item-expanded");
                }
                if (!record.learned) {
                    classes.push("collection-item-locked");
                }

                return (
                    <div
                        className={classes.join(" ")}
                        key={id}
                        onClick={!record.learned ? undefined : () => this.itemOnClick(id)}
                    >
                        <span className="collection-item-title">{lookup.getLearnable(id).front}</span>
                        <span className="collection-item-subtitle">{lookup.getLearnable(id).back}</span>
                        <span className="collection-item-progress">
                            <span
                                className="collection-item-progress-inner"
                                style={{ right: `${score}%` }}
                            >
                                {(100 - score).toFixed()}%
                            </span>
                        </span>
                        <div className="collection-item-detail">
                            <AudioButton
                                id={id}
                            />
                            {groupedLearnables[id].items.map((learnable, idx) => {
                                 if (!isLocked(learnable.id)) {
                                     return (
                                         <p key={idx}>
                                             {learnable.front} = {learnable.back}&nbsp;
                                             Score: {this.props.learned.get(learnable.id).score}
                                         </p>
                                     );
                                 }
                                 return (
                                     <p key={idx}>Component locked…keep wandering!</p>
                                 );
                             })}
                        </div>
                    </div>
                );
            });

            contents = maybeContents.filter(x => x !== null) as JSX.Element[];
        }

        return (
            <TransitionGroup>
                <CSSTransition
                    key={key}
                    timeout={{ enter: 500, exit: 400 }}
                    classNames="fade"
                    onExited={this.onExited}
                >
                    <section className="collection-display">
                        <div id="collection-header">
                            {header}
                        </div>
                        {(collection.description && this.state.showCollection) ?
                         <div id="collection-description">
                             {collection.description.map((line, idx) => <p key={idx}>{line}</p>)}
                         </div>
                         : false}
                        <div id="collection-body">
                            {contents}
                        </div>
                    </section>
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
