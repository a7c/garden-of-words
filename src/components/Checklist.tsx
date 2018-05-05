import * as React from "react";

import * as model from "../model/model";
import * as quest from "../model/quest";

interface Props {
    store: model.Store;
    checklist: quest.Checklist;
}

export default class Checklist extends React.Component<Props> {
    render() {
        const { store, checklist } = this.props;

        return (
            <ul className="checklist">
                {checklist.map((entry, idx) => {
                     const checked = entry.filter.check(store);
                     const description = checked ? entry.description :
                                         (entry.hiddenDescription || entry.description);
                     return (
                         <li key={idx}>
                             <input
                                 type="checkbox"
                                 disabled={true}
                                 checked={checked}
                             />
                             {description}
                         </li>
                     );
                 })}
            </ul>
        );
    }
}
