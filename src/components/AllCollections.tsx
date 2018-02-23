import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as model from "../model/model";
import CollectionComponent from "./Collection";

interface AllCollectionsProps {
    collections: immutable.Map<model.CollectionId, model.Collection>;
    onFinished: () => void;
}

interface AllCollectionsState {
    showAllCollections: boolean;
    showedAllCollections: boolean;
    viewCollection: model.CollectionId | null;
}

export default class AllCollectionsComponent extends React.Component<AllCollectionsProps, AllCollectionsState> {
    constructor(props: AllCollectionsProps) {
        super(props);
        this.state = { showAllCollections: false, showedAllCollections: false, viewCollection: null };
        window.setTimeout(
            () => {
                this.setState({ showAllCollections: true });
            },
            500
        );
    }

    onCollectionDone = () => {
        this.setState({showAllCollections: true, showedAllCollections: false, viewCollection: null});
    }

    onExited = (node: HTMLElement) => {
        if (this.state.showedAllCollections) {
            this.props.onFinished();
        }
    }

    getCollectionInfo = (id: model.CollectionId) => {
        // console.log(this.props.collections.get(id));
        // set up a new component for the collection they clicked on
        this.setState({ showAllCollections: false, viewCollection: id });
    }

    render() {
        // const ev = this.props.event;
        let key = "blank";
        let contents = [<span key="blank"/>];
        let button = <span/>;

        if (this.state.showAllCollections) {
            console.log("Showing Collections");
            key = "collection";

            let ids = this.props.collections.keySeq().toArray();

            contents = ids.map((id) =>
                            (
                                <button key={id} onClick={() => this.getCollectionInfo(id)}>
                                    {id}
                                </button>
                            ));

            button = (
                    <button
                        onClick={() => this.setState({
                                showAllCollections: false,
                                showedAllCollections: true
                            })}
                    >
                        Back
                    </button>
                );
        }
        else if (this.state.viewCollection !== null) {
            return (
                    <CollectionComponent
                        collection={this.props.collections.get(this.state.viewCollection)}
                        onFinished={this.onCollectionDone}
                    />
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
