import * as immutable from "immutable";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as model from "../model/model";
import * as lookup from "../model/lookup";
import * as quest from "../model/quest";

import LabeledPanel from "./LabeledPanel";
import Checklist from "./Checklist";
import "../Common.css";
import "./QuestLog.css";

class QuestLogEntry extends React.Component<{
    q: quest.Quest,
    stage: model.QuestStage,
    store: model.Store,
}> {
    render() {
        const { q, stage, store } = this.props;
        const title = q.complete === stage ? `${q.name} (completed)` : q.name;
        const checklist = q.checklists.get(stage);
        return (
            <LabeledPanel title={title}>
                <p>{q.journal.get(stage)}</p>
                {checklist ?
                 <Checklist store={store} checklist={checklist} />
                 : false}
            </LabeledPanel>
        );
    }
}

interface Props {
    store: model.Store;
}

export default class QuestLog extends React.Component<Props> {
    render() {
        const incomplete: [quest.Quest, model.QuestStage][] = [];
        const complete: quest.Quest[] = [];

        const { quests } = this.props.store;

        const entries = quests.entries() as
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

        return (
            <div id="quest-log">
                {incomplete.length === 0 ?
                 <h2>No current quests.</h2>
                 :
                 incomplete.map(([ q, stage ], idx) => (
                     <QuestLogEntry key={idx} store={this.props.store} q={q} stage={stage} />
                ))}
                <hr/>
                {complete.length === 0 ?
                 <h2>No completed quests.</h2>
                 :
                 complete.map((q, idx) => (
                     <QuestLogEntry key={idx} store={this.props.store} q={q} stage={q.complete} />
                ))}
            </div>
        );
    }
}
