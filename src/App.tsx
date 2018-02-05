import * as immutable from "immutable";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import "./App.css";
import * as actions from "./reducers/actions";
import * as model from "./model/model";

const logo = require("./logo.svg");

interface TestProps {
    learned: immutable.Seq.Indexed<model.Learned>;
    onLearn: (item: model.Learnable) => void;
}
function TestComponent({ learned, onLearn }: TestProps) {
    return (
        <div>
            <ul>
                {learned.toArray().map((item) => <li key={item.item || 0}>{item.item}</li>)}
            </ul>
            <button onClick={() => onLearn("thing")}>WANDER</button>
        </div>
    );
}

const Test = connect(
    (store: model.Store) => ({ learned: store.learned.valueSeq() }),
    (dispatch: Dispatch<actions.Action>) => ({ onLearn: (item: string) => dispatch(actions.learn(item)) })
)(TestComponent);

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Test/>
      </div>
    );
  }
}

export default App;
