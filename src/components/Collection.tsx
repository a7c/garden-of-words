import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as event from "../model/event";
import * as immutable from "immutable";
import * as model from "../model/model";

export interface CollectionProps {
    collections: immutable.Map<model.CollectionId, model.Collection>;
}

interface CollectionState {}

export class CollectionComponent extends React.Component<CollectionProps, CollectionState> {
    constructor(props: CollectionProps) {
        super(props);
    }

    render() {

      console.log("Hello world");
      return (
          <div>
            <button> hello </button>
          </div>
        );
    }
}
