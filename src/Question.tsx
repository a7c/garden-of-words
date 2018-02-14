import * as React from "react";
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
    constructor(props: QuestionProps) {
        super(props);
    }

    render() {
        const q = this.props.question;
        if (q instanceof question.MultipleChoice) {
            return (
                <MultipleChoice question={q} onReview={this.props.onReview} />
            );
        }
        else {
            return <p>Unsupported question!</p>;
        }
    }
}
