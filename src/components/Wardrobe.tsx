import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as model from "../model/model";
import * as event from "../model/event";

import Dropdown from "react-dropdown";
import * as dropdown from "react-dropdown";
import LabeledPanel from "./LabeledPanel";

import "react-dropdown/style.css";
import "../Common.css";
import "./Wardrobe.css";

interface Props {
    store: model.Store;
    dispatch: (effect: event.Effect, store: model.Store) => void;
}

export default class Wardrobe extends React.Component<Props> {
    themeify = (option: dropdown.Option) => {
        this.props.dispatch(new event.ThemeEffect(option.value), this.props.store);
    }

    render() {
        const { store } = this.props;

        const themes = store.wardrobe.themes.toArray().sort();
        const hats = store.wardrobe.hats.toArray().sort();

        return (
            <div id="wardrobe">
                <LabeledPanel id="theme" title="Theme">
                    <div id="dropdown">
                        <Dropdown
                            options={themes}
                            onChange={this.themeify}
                            value={{
                                label: store.wardrobe.currentTheme,
                                value: store.wardrobe.currentTheme,
                            }}
                        />
                    </div>
                </LabeledPanel>
                <LabeledPanel id="hat" title="Hats">
                    <div id="dropdown">
                        <Dropdown
                            options={hats}
                            value={store.wardrobe.currentHat ? {
                                    label: store.wardrobe.currentHat,
                                    value: store.wardrobe.currentHat,
                                } : undefined}
                        />
                    </div>
                </LabeledPanel>
            </div>
        );
    }
}
