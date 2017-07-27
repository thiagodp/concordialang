import { Node, NamedNode } from './Node';


export interface ScenarioSentence extends Node {

}

export interface Scenario extends NamedNode {

    description?: string;

    sentences: Array< ScenarioSentence >;

}