import { ContentNode } from "./Node";
import { NLPResult } from "../nlp/NLPResult";

export interface Step extends ContentNode {

    type: 'given' | 'when' | 'then' | 'and' | 'otherwise';

    nlpResult?: NLPResult;

    action: string;
    targets?: string[];
    targetType?: string;
    values?: string[] | number[];
    invalid?: boolean;
}

export interface StepGiven extends Step {
    type: 'given';
}

export interface StepWhen extends Step {
    type: 'when';
}

export interface StepThen extends Step {
    type: 'then';
}

export interface StepAnd extends Step {
    type: 'and';
}

export interface StepOtherwise extends Step {
    type: 'otherwise';
}