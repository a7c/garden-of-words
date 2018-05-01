export type Callback = (path: string) => void;

export class RouterClass {
    listeners: Map<number, Callback[]>;

    constructor() {
        window.addEventListener("hashchange", this.reroute);
        this.listeners = new Map();
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
        window.history.pushState({ path }, "", `#!/${path.join("/")}`);
        if (dispatch) {
            this.dispatch(path);
        }
    }

    dispatch(path: string[]) {
        for (let i = 0; i < path.length; i++) {
            const cbs = this.listeners.get(i);
            if (cbs) {
                cbs.forEach(cb => cb(path[i]));
            }
        }
    }
}

const Router = new RouterClass();
export default Router;
