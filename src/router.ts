export type Callback = (path: string) => void;

export class RouterClass {
    listeners: Map<number, Callback[]>;

    constructor() {
        window.addEventListener("hashchange", this.reroute);
        this.listeners = new Map();
        window.history.pushState({ path: [] }, "", "#!/");
    }

    reroute = () => {

    }

    listen(index: number, callback: Callback) {
        if (!this.listeners.has(index)) {
            this.listeners.set(index, []);
        }

        this.listeners.get(index)!.push(callback);
    }

    navigate(path: string[], dispatch: boolean = true) {
        let commonPrefixLength = 0;

        if (window.history.state.path) {
            // Don't dispatch change events to parts of path that
            // didn't change
            const oldPath = window.history.state.path as string[];
            if (path.length <= oldPath.length) {
                for (let i = 0; i < path.length; i++) {
                    if (path[i] === oldPath[i]) {
                        commonPrefixLength = i + 1;
                    }
                    else {
                        break;
                    }
                }
            }
        }

        if (commonPrefixLength >= path.length) {
            return;
        }

        window.history.pushState({ path }, "", `#!/${path.join("/")}`);
        if (dispatch) {
            this.dispatch(path, commonPrefixLength);
        }
    }

    dispatch(path: string[], startFrom: number = 0) {
        for (let i = startFrom; i < path.length; i++) {
            const cbs = this.listeners.get(i);
            if (cbs) {
                cbs.forEach(cb => cb(path[i]));
            }
        }
    }
}

const Router = new RouterClass();
export default Router;
