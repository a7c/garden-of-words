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

    hatify = (option: dropdown.Option) => {
        const value = option.value === "(no hat)" ? "" : option.value;
        this.props.dispatch(new event.FlagEffect(`hat:${value}`, !!value), this.props.store);
    }

    render() {
        const { store } = this.props;

        const themes = store.wardrobe.themes.toArray().sort();
        const hats = [
            {
                label: "(no hat)",
                value: "",
            }
        ].concat(store.wardrobe.hats.toArray().sort().map(h => ({
            label: h, value: h,
        })));

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
                            onChange={this.hatify}
                            value={store.wardrobe.currentHat ? {
                                    label: store.wardrobe.currentHat,
                                    value: store.wardrobe.currentHat,
                                } : hats[0]}
                        />
                    </div>
                </LabeledPanel>
            </div>
        );
    }
}
