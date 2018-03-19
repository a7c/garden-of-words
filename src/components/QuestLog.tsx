import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as model from "../model/model";
import * as lookup from "../model/lookup";
import * as quest from "../model/quest";

import LabeledPanel from "./LabeledPanel";
import "../Common.css";
import "./QuestLog.css";

interface Props {
    quests: immutable.Map<model.QuestId, model.QuestStage>;
}

export default class QuestLog extends React.Component<Props> {
    render() {
        const incomplete: [quest.Quest, model.QuestStage][] = [];
        const complete: quest.Quest[] = [];

        const entries = this.props.quests.entries() as
            IterableIterator<[ model.QuestId, model.QuestStage ]>;
        for (const [ id, stage ] of entries) {
            const q = lookup.getQuest(id);
            if (q.complete === stage) {
                complete.push(q);
            }
            else {
                incomplete.push([ q, stage ]);
            }
        }

        incomplete.sort(([q1], [q2]) => q1.name.localeCompare(q2.name));
        complete.sort((q1, q2) => q1.name.localeCompare(q2.name));

        console.log(incomplete);

        return (
            <div id="quest-log">
                {incomplete.length === 0 ?
                 <h2>No current quests.</h2>
                 :
                 incomplete.map(([ q, stage ], idx) => (
                    <LabeledPanel key={idx} title={q.name}>
                        <p>{q.journal.get(stage)}</p>
                    </LabeledPanel>
                ))}
                <hr/>
                {complete.length === 0 ?
                 <h2>No completed quests.</h2>
                 :
                 complete.map((q, idx) => (
                    <LabeledPanel key={idx} title={`${q.name} (completed)`}>
                        <p>{q.journal.get(q.complete)}</p>
                    </LabeledPanel>
                ))}
            </div>
        );
    }
}
