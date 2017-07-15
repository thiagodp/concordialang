import { Node } from './Node';

export interface ScenarioSentence extends Node {

}

export interface Scenario extends Node {

    name: string;
    description?: string;

    sentences: Array< ScenarioSentence >;

}