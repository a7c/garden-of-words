import * as React from "react";

export default class OnlyOnce<A, B> extends React.Component<A, B> {
    __called = false; //tslint:disable-line

    once(fn: () => void) {
        if (this.__called) {
            return;
        }
        this.__called = true;
        fn();
    }
}
