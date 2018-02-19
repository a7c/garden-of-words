import * as model from "../model/model";
import * as actions from "../actions/actions";

export function reducer(state: model.Store = new model.Store(), action: actions.Action): model.Store {
    console.log(action);
    switch (action.type) {
    case actions.LEARN: {
        return state.set("learned", state.learned.set(action.item.id, new model.Learned({
            item: action.item,
            lastReviewed: new Date(),
            score: 0.0,
        })));
    }
    case actions.REVIEW: {
        const learned = state.learned.get(action.id);
        const scoreEarned = action.correct ? Math.random() : 0;
        const updatedLearned = learned.set("score", learned.get("score") + scoreEarned)
                                      .set("lastReviewed", new Date());

        return state.set("learned", state.learned.set(action.id, updatedLearned));
    }
    case actions.MEDITATE: {
        alert("meditating");
        return state;
    }
    case actions.UPDATE_FLAG: {
        return state.set("flags", state.flags.set(action.flag, action.value));
    }
    default:
        console.error(`reducer: Unrecognized action ${JSON.stringify(action)}.`);
    }
    return state;
}
