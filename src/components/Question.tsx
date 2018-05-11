import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import AnimatedNumber from "react-animated-number";

import * as model from "../model/model";
import * as question from "../model/question";
import * as lookup from "../model/lookup";

import "../Common.css";
import "./Question.css";

import Router from "../router";
import Dialog from "./Dialog";
import Fade from "./Fade";
import OnlyOnce from "./OnlyOnce";

interface QuestionProps {
    store: model.Store;
    question: question.Question;
    onReview: (id: model.LearnableId, correct: boolean) => void;
    onNotHappening: () => void;
}

interface QuestionState {
    status: "right" | "wrong" | "answering";
    learnableIds: model.LearnableId[];
}

interface MultipleChoiceProps {
    question: question.MultipleChoice;
    onReview: (ids: model.LearnableId[], correct: boolean) => void;
}

interface TypeInProps {
    question: question.TypeIn;
    onReview: (ids: model.LearnableId[], correct: boolean) => void;
}

interface TypeInState {
    input: string;
}

interface PostQuestionProps {
    store: model.Store;
    correct: boolean;
    learnableIds: model.LearnableId[];
    applyEffects: () => void;
    onNotHappening: () => void;
}

class MultipleChoice extends OnlyOnce<MultipleChoiceProps, {}> {
    constructor(props: MultipleChoiceProps) {
        super(props);
    }

    reviewWord = (idx: number) => {
        this.once(() => {
            const q = this.props.question;
            this.props.onReview(q.teaches, q.correct(idx));
        });
    }

    render() {
        const q = this.props.question;

        const questionCode = q.reverse ? "front" : "back";
        const answerCode = q.reverse ? "back" : "front";

        const choices = q.choices.map((c, idx) =>
            (
                <li className="review-item" key={idx}>
                    <button className="review" onClick={() => this.reviewWord(idx)}>{c[questionCode]}</button>
                </li>
            ));
        return (
            <section className="question">
                <p>{q.prompt()}: {q.question[answerCode]}</p>
                <ul>
                    {choices}
                </ul>
            </section>
        );
    }
}

class TypeIn extends OnlyOnce<TypeInProps, TypeInState> {
    inputEl: HTMLElement | null;

    constructor(props: TypeInProps) {
        super(props);

        this.state = {input : ""};
    }

    componentDidMount() {
        // Janky hack. Focusing it right away (while slide
        // transition happens) causes Chrome to scroll
        // the body (WHY CHROME), so wait until it's done.
        setTimeout(
            () => {
                if (this.inputEl) {
                    this.inputEl.focus();
                }
            },
            500
        );
    }

    _handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({input: event.currentTarget.value});
    }

    _handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.once(() => {
            const q = this.props.question;
            const input = this.state.input.trim();

            this.props.onReview(q.teaches, q.correct(input));
        });
    }

    _handleGiveUp = () => {
        const q = this.props.question;
        this.props.onReview(q.teaches, false);
    }

    prompt(learnable: model.Learnable) {
        if (learnable.type === "vocab-kana-romaji") {
            return `Type the reading (in romaji): ${learnable.front}`;
        }
        else if (learnable.type === "vocab") {
            return `Type the meaning (in English): ${learnable.front}`;
        }
        return `Type the equivalent: ${learnable.front}`;
    }

    render() {
        const q = this.props.question;
        // TODO: support for different types of type-in questions
        return (
            <section className="question question-typein">
                <form onSubmit={this._handleSubmit}>
                    <p>{this.prompt(q.learnable)}</p>
                    <input
                        type="text"
                        ref={(input) => this.inputEl = input}
                        value={this.state.input}
                        onChange={this._handleChange}
                    />
                    <button type="submit">Submit</button>
                    <button type="button" className="give-up" onClick={this._handleGiveUp}>Give Up</button>
                </form>
            </section>
        );
    }
}

class PostQuestion extends OnlyOnce<PostQuestionProps, {}> {
    componentDidMount() {
        setTimeout(
            () => {
                this.props.applyEffects();
            },
            250
        );
    }

    dismiss = () => {
        this.once(() => {
            this.props.onNotHappening();
        });
    }

    showCollection(id: model.CollectionId) {
        Router.navigate([ "Collections", id ]);
    }

    componentWillMount() {
        document.addEventListener("keydown", this.onKey, true);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKey, true);
    }

    onKey = (e: KeyboardEvent) => {
        switch (e.code) {
            case "Space":
            case "Enter": {
                // Auto-accept the default
                this.dismiss();
                break;
            }
            default:
                break;
        }
    }

    render() {
        const { store } = this.props;
        return (
            <div>
                <p>
                    <strong>{this.props.correct ? "Correct!" : "Wrong, try again!"}</strong>
                </p>
                <p>Reviewed:</p>
                {this.props.learnableIds.map((learnableId, idx) => {
                     const learnable = lookup.getLearnable(learnableId);
                     const collection = lookup.getCollection(learnableId);
                     const record = store.learned.get(learnableId);
                     const score = record ? record.score : 0;
                     const prompt = lookup.getLearnablePrompt(learnable.type);
                     return (
                         <div className="reviewed-learnable" key={idx}>
                             <header>
                                 <span>{learnable.front}</span>
                                 &nbsp;{prompt}&nbsp;
                                 <span>“{learnable.back}”</span>
                             </header>
                             <div>
                                 <div className="progress">
                                     <span>Mastery:</span>
                                     <div className="progress-outer">
                                         <div
                                             className="progress-inner"
                                             style={{ right: `${100 - score}%` }}
                                         />
                                     </div>
                                 </div>
                                 <button
                                     onClick={() => this.showCollection(learnable.collection)}
                                 >
                                     View {collection.name}
                                 </button>
                             </div>
                         </div>
                     );
                 })}

                <br />
                <button className="continue" onClick={this.dismiss}>Continue</button>
            </div>
        );
    }
}

export default class QuestionComponent extends React.Component<QuestionProps, QuestionState> {
    constructor(props: QuestionProps) {
        super(props);
        this.state = { status: "answering", learnableIds: [] };
    }

    onReview = (learnableIds: model.LearnableId[], correct: boolean) => {
        this.setState({
            status: correct ? "right" : "wrong",
            learnableIds,
        });
    }

    applyEffects = () => {
        this.state.learnableIds.forEach(id => {
            this.props.onReview(id, this.state.status === "right");
        });
    }

    render() {
        const q = this.props.question;
        if (this.state.status !== "answering") {
            return (
                <PostQuestion
                    key="postquestion"
                    store={this.props.store}
                    correct={this.state.status === "right"}
                    learnableIds={this.state.learnableIds}
                    applyEffects={this.applyEffects}
                    onNotHappening={this.props.onNotHappening}
                />
            );
        }
        else if (q instanceof question.MultipleChoice) {
            return <MultipleChoice key="mc" question={q} onReview={this.onReview} />;
        }
        else if (q instanceof question.TypeIn) {
            return <TypeIn key="ti" question={q} onReview={this.onReview} />;
        }
        else {
            return <p>Unsupported question!</p>;
        }
    }
}
