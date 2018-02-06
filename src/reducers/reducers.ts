import * as model from "../model/model";
import * as actions from "./actions";

let ctr = 0;

export function reducer(state: model.Store = new model.Store(), action: actions.Action): model.Store {
    console.log(action);
    switch (action.type) {
    case actions.LEARN: {
        return state.set("learned", state.learned.set(ctr++, new model.Learned({
            item: action.item,
            lastReviewed: new Date(),
            score: 0.0,
        })));
    }
    case actions.REVIEW: {
        const learned = state.learned.get(action.id);
        const updatedLearned = learned.set("score", learned.get("score") + Math.random());
        return state.set("learned", state.learned.set(action.id, updatedLearned));
    }
    default:
        console.error(`reducer: Unrecognized action ${action}.`);
    }
    return state;
}
