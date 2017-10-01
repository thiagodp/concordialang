import { ContentNode } from "./Node";

export interface Step extends ContentNode {
    type: 'given' | 'when' | 'then' | 'and' | 'otherwise';
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