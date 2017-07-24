import { ASTNode, NamedASTNode } from './ASTNode';


export interface ScenarioSentence extends ASTNode {

}

export interface Scenario extends NamedASTNode {

    description?: string;

    sentences: Array< ScenarioSentence >;

}