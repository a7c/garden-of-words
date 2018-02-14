import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./Common.css";
import "./Question.css";
import * as model from "./model/model";
import * as question from "./model/question";

interface QuestionProps {
    question: question.Question;
    onReview: (id: model.LearnableId, correct: boolean) => void;
}

interface MultipleChoiceProps extends QuestionProps {
    question: question.MultipleChoice;
}

interface QuestionState {
    status: "right" | "wrong" | "answering" | "done";
}

// TODO: YOU MIGHT WANT TO REUSE THIS FOR OTHER THINGS. MOVE IT TO A SEPARATE FILE.
interface DialogProps {
    text: string;
    style: string;
}

class Dialog extends React.Component<DialogProps> {
    constructor(props: DialogProps) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.style}>
                {this.props.text}
            </div>
        );
    }
}

class MultipleChoice extends React.Component<MultipleChoiceProps> {
    reviewWord: (idx: number) => void;

    constructor(props: MultipleChoiceProps) {
        super(props);
        this.reviewWord = (idx: number) => {
            const q = this.props.question;
            // TODO: review all taught items
            this.props.onReview(q.teaches[0], q.correct(idx));
        };
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

export class QuestionComponent extends React.Component<QuestionProps, QuestionState> {
    onReview: (id: model.LearnableId, correct: boolean) => void;
    onExited: (node: HTMLElement) => void;
    _onExited: (node: HTMLElement) => void;

    constructor(props: QuestionProps) {
        super(props);
        this.state = { status: "answering" };

        this.onReview = (id: model.LearnableId, correct: boolean) => {
            this.setState({
                status: correct ? "right" : "wrong",
            });
            this._onExited = (node: HTMLElement) => {
                if (node.classList.contains("Question")) {
                    window.setTimeout(
                        () => {
                            this.setState({ status: "done" });
                        },
                        1000
                    );
                }
                else {
                    this.props.onReview(id, correct);
                }
                return;
            };
        };
        this._onExited = (node: HTMLElement) => {
            return;
        };

        this.onExited = (node: HTMLElement) => {
            this._onExited(node);
        };
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
            else if (this.state.status === "done") {
                contents = <span/>;
            }

            return (
                <TransitionGroup>
                    <CSSTransition
                        key={this.state.status}
                        timeout={{ enter: 1000, exit: 800 }}
                        classNames="fade"
                        onExited={this.onExited}
                    >
                        {contents}
                    </CSSTransition>
                </TransitionGroup>
            );
        }
        else {
            return <p>Unsupported question!</p>;
        }
    }
}
