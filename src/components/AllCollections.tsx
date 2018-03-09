import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as model from "../model/model";
import LabeledPanel from "./LabeledPanel";

import "../Common.css";
import "./AllCollections.css";

import "react-dropdown/style.css";
import Dropdown from "react-dropdown";
import ActionButton from "./ActionButton";

import CollectionComponent from "./Collection";

interface AllCollectionsProps {
    collections: immutable.Map<model.CollectionId, model.Collection>;
    learned: immutable.Map<model.LearnableId, model.Learned>;
}

interface AllCollectionsState {
    viewCollection: model.CollectionId | null;
}

export default class AllCollectionsComponent extends React.Component<AllCollectionsProps, AllCollectionsState> {

    inputField: HTMLInputElement | null;

    fakeCollections: string[] = [];

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

    handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            this.forceUpdate();
            this.fakeCollections.push(this.inputField!.value);
        }
    }

    render() {
        // const ev = this.props.event;
        let key = "blank";
        let contents = [<span key="blank"/>];

        if (this.state.viewCollection === null) {
            console.log("Showing Collections");
            key = "collection";

            let ids = this.props.collections.keySeq().toArray().concat(this.fakeCollections);

            contents = ids.map((id) =>
                            (
                                <ActionButton
                                    label={id}
                                    onClick={() => this.getCollectionInfo(id)}
                                />
                            ));
        }
        else {
            let id = this.state.viewCollection;
            contents = ([(
                  <CollectionComponent
                    name={id}
                    collection={this.props.collections.get(id)}
                    learned={this.props.learned}
                    onFinished={() => this.setState({"viewCollection": null})}
                  />
                )]);
        }

        let options = ["Unlocked", "Alphabetical", "Recently Learned"];

        // tslint:disable-next-line
        let onSearch = this.handleKeyPress as any;

        return (
          <section id="collection-list">
              <LabeledPanel id="collections-panel" title="Collections">
                  <div id="search-menu">
                      <LabeledPanel id="collections-search" title="Search">
                          <input
                            ref={input => this.inputField = input}
                            type="text"
                            id="search-box"
                            onKeyPress={onSearch}
                          />
                      </LabeledPanel>
                      <LabeledPanel id="sort-by" title="Sort By">
                          <div id="dropdown">
                              <Dropdown options={options}/>
                          </div>
                      </LabeledPanel>
                  </div>
                  {contents}
              </LabeledPanel>
          </section>
        );
    }
}
