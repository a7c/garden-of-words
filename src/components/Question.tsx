import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../Common.css";
import * as model from "../model/model";
import * as question from "../model/question";

import Dialog from "./Dialog";
import Fade from "./Fade";

interface QuestionProps {
    question: question.Question;
    onReview: (id: model.LearnableId, correct: boolean) => void;
}

interface MultipleChoiceProps extends QuestionProps {
    question: question.MultipleChoice;
}

interface QuestionState {
    status: "right" | "wrong" | "answering";
}

class MultipleChoice extends React.Component<MultipleChoiceProps> {
    constructor(props: MultipleChoiceProps) {
        super(props);
    }

    reviewWord = (idx: number) => {
        const q = this.props.question;
        // TODO: review all taught items
        this.props.onReview(q.teaches[0], q.correct(idx));
    }

    render() {
        const q = this.props.question;
        const choices = q.choices.map((c, idx) =>
            (
                <li className="ReviewContainer" key={idx}>
                    <button className="Button Review" onClick={() => this.reviewWord(idx)}>{c.back()}</button>
                </li>
            ));
        return (
            <section className="Question">
                <p>Find the matching choice: {q.question.front()}</p>
                <ul>
                    {choices}
                </ul>
            </section>
        );
    }
}

export default class QuestionComponent extends React.Component<QuestionProps, QuestionState> {
    learnableId: model.LearnableId | null;
    fade: Fade | null;

    constructor(props: QuestionProps) {
        super(props);
        this.state = { status: "answering" };
    }

    onReview = (id: model.LearnableId, correct: boolean) => {
        this.setState({
            status: correct ? "right" : "wrong",
        });
        this.learnableId = id;
        this.fade!.delayedExit();
    }

    onFinished = () => {
        this.props.onReview(this.learnableId!, this.state.status === "right");
    }

    render() {
        const q = this.props.question;
        if (q instanceof question.MultipleChoice) {
            let contents = <MultipleChoice key="mc" question={q} onReview={this.onReview} />;
            if (this.state.status === "right") {
                contents = (
                    <Dialog
                        key="dialog"
                        text="对！"
                        style=""
                    />
                );
            }
            else if (this.state.status === "wrong") {
                contents = (
                    <Dialog
                        key="dialog"
                        text="错，加油！"
                        style=""
                    />
                );
            }

            return (
                <Fade ref={f => this.fade = f} onFinished={this.onFinished}>
                  <div className="PopupBox">
                    {contents}
                  </div>
                </Fade>
            );
        }
        else {
            return <p>Unsupported question!</p>;
        }
    }
}
