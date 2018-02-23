import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as model from "../model/model";
import CollectionComponent from "./Collection";

interface AllCollectionsProps {
    collections: immutable.Map<model.CollectionId, model.Collection>;
    learned: immutable.Map<model.LearnableId, model.Learned>;
}

interface AllCollectionsState {
    viewCollection: model.CollectionId | null;
}

export default class AllCollectionsComponent extends React.Component<AllCollectionsProps, AllCollectionsState> {
    constructor(props: AllCollectionsProps) {
        super(props);
        this.state = { viewCollection: null };
    }

    onCollectionDone = () => {
        this.setState({ viewCollection: null });
    }

    getCollectionInfo = (id: model.CollectionId) => {
        // console.log(this.props.collections.get(id));
        // set up a new component for the collection they clicked on
        this.setState({ viewCollection: id });
    }

    render() {
        // const ev = this.props.event;
        let key = "blank";
        let contents = [<span key="blank"/>];

        if (this.state.viewCollection === null) {
            console.log("Showing Collections");
            key = "collection";

            let ids = this.props.collections.keySeq().toArray();

            contents = ids.map((id) =>
                            (
                                <button className="Button" key={id} onClick={() => this.getCollectionInfo(id)}>
                                    {id}
                                </button>
                            ));
        }
        else {
            let id = this.state.viewCollection;
            return (
                  <CollectionComponent
                    collection={this.props.collections.get(id)}
                    learned={this.props.learned}
                    onFinished={() => this.setState({"viewCollection": null})}
                  />
                );
        }

        return (
            <TransitionGroup>
                <CSSTransition
                    key={key}
                    timeout={{ enter: 1000, exit: 800 }}
                    classNames="fade"
                >
                    <div>
                        {contents}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        );
    }
}
