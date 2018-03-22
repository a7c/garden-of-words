import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as model from "../model/model";
import * as question from "../model/question";

import "../Common.css";
import "./Question.css";

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
        for (const learnable of q.teaches) {
            this.props.onReview(learnable, q.correct(idx));
        }
    }

    render() {
        const q = this.props.question;
        const choices = q.choices.map((c, idx) =>
            (
                <li className="review-item" key={idx}>
                    <button className="review" onClick={() => this.reviewWord(idx)}>{c.back}</button>
                </li>
            ));
        return (
            <section className="question">
                <p>Find the matching choice: {q.question.front}</p>
                <ul>
                    {choices}
                </ul>
            </section>
        );
    }
}

interface TypeInProps extends QuestionProps {
    question: question.TypeIn;
}

interface TypeInState {
    input: string;
}

class TypeIn extends React.Component<TypeInProps, TypeInState> {
    constructor(props: TypeInProps) {
        super(props);

        this.state = {input : ""};
    }

    _handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({input: event.currentTarget.value});
    }

    _handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const q = this.props.question;
        const input = this.state.input.trim();

        for (const learnable of q.teaches) {
            this.props.onReview(learnable, q.correct(input));
        }
    }

    prompt(learnable: model.Learnable) {
        if (learnable.type === "vocab-kana-romaji") {
            return `Type the reading (in romaji): ${learnable.front}`;
        }
        return `Type the equivalent: ${learnable.front}`;
    }

    render() {
        const q = this.props.question;
        // TODO: support for different types of type-in questions
        return (
            <section className="question">
                <p>{this.prompt(q.learnable)}</p>
                <form onSubmit={this._handleSubmit}>
                    <label>
                        <input type="text" value={this.state.input} onChange={this._handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </section>
        );
    }
}

export default class QuestionComponent extends React.Component<QuestionProps, QuestionState> {
    constructor(props: QuestionProps) {
        super(props);
        this.state = { status: "answering" };
    }

    onReview = (id: model.LearnableId, correct: boolean) => {
        this.setState({
            status: correct ? "right" : "wrong",
        });
        this.props.onReview(id, correct);
    }

    render() {
        const q = this.props.question;
        if (q instanceof question.MultipleChoice) {
            let contents = <MultipleChoice key="mc" question={q} onReview={this.onReview} />;
            if (this.state.status === "right") {
                contents = (
                    <Dialog
                        key="dialog"
                        text="Correct!"
                        style=""
                    />
                );
            }
            else if (this.state.status === "wrong") {
                contents = (
                    <Dialog
                        key="dialog"
                        text="Incorrect, try again!"
                        style=""
                    />
                );
            }

            return contents;
        }
        else if (q instanceof question.TypeIn) {
            return <TypeIn key="ti" question={q} onReview={this.onReview} />;
        }
        else {
            return <p>Unsupported question!</p>;
        }
    }
}
