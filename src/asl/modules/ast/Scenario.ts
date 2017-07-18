import { ASTNode } from './ASTNode';

export interface ScenarioSentence extends ASTNode {

}

export interface Scenario extends ASTNode {

    name: string;
    description?: string;

    sentences: Array< ScenarioSentence >;

}