import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as model from "../model/model";
import * as lookup from "../model/lookup";
import LabeledPanel from "./LabeledPanel";

import "../Common.css";
import "./AllCollections.css";

import "react-dropdown/style.css";
import Dropdown from "react-dropdown";
import Router from "../router";
import ActionButton from "./ActionButton";

import CollectionComponent from "./Collection";

interface AllCollectionsProps {
    collections: immutable.Map<model.CollectionId, model.Collection>;
    learned: immutable.Map<model.LearnableId, model.Learned>;
}

interface AllCollectionsState {
    viewCollection: model.CollectionId | null;
    searchText: string | null;
}

export default class AllCollectionsComponent extends React.Component<AllCollectionsProps, AllCollectionsState> {

    inputField: HTMLInputElement | null;

    constructor(props: AllCollectionsProps) {
        super(props);
        this.state = { viewCollection: null, searchText: null };
    }

    componentDidMount() {
        Router.listen(1, this.reroute);
        if (Router.get(0) === "Collections" && Router.get(1)) {
            this.reroute(Router.get(1)!);
        }
    }

    reroute = (path: string) => {
        console.log(path);
        const ids = Object.keys(lookup.getCollections());
        for (const id of ids) {
            if (path === id) {
                this.setState({ viewCollection: id });
                break;
            }
        }
    }

    onCollectionDone = () => {
        this.setState({ viewCollection: null });
    }

    getCollectionInfo = (id: model.CollectionId) => {
        // set up a new component for the collection they clicked on
        this.setState({ viewCollection: id });
    }

    handleKeyPress = (event: KeyboardEvent) => {
        // tslint:disable-next-line
        let text: string = (event.target as any).value;
        if (text === "") {
            if (this.state.searchText != null) {
                this.setState({ searchText: null });
            }
        } else {
            this.setState({ searchText: text });
        }
    }

    render() {
        let key = "blank";
        let contents = [<span key="blank"/>];

        if (this.state.viewCollection === null) {
            key = "collection";

            const ids = Object.keys(lookup.getCollections());

            contents = ids.map(id => {
                const collection = lookup.getCollection(id);
                return (
                    <ActionButton
                        key={id}
                        onClick={() => this.getCollectionInfo(id)}
                    >
                        <span className="collection-title">{collection.name}</span>
                        <span className="collection-subtitle">{collection.subtitle}</span>
                    </ActionButton>
                );
            });
        } else {
            const id = this.state.viewCollection;
            contents = ([(
                  <CollectionComponent
                      key={0}
                      name={id}
                      encountered={this.props.collections.get(id)}
                      learned={this.props.learned}
                      onFinished={() => this.setState({"viewCollection": null})}
                      searchTerm={this.state.searchText}
                  />
                )]);
        }

        const options = ["Unlocked", "Alphabetical", "Recently Learned"];

        // tslint:disable-next-line
        const onSearch = this.handleKeyPress as any;

        return (
          <section id="collection-list">
              <LabeledPanel id="collections-panel">
                  <div id="search-menu">
                      <LabeledPanel id="collections-search" title="Search">
                          <input
                            ref={input => this.inputField = input}
                            type="text"
                            id="search-box"
                            onKeyUp={onSearch}
                          />
                      </LabeledPanel>
                      <LabeledPanel id="sort-by" title="Sort By">
                          <div id="dropdown">
                              <Dropdown options={options}/>
                          </div>
                      </LabeledPanel>
                  </div>
                  <div id="collections-table">
                      {contents}
                  </div>
              </LabeledPanel>
          </section>
        );
    }
}
