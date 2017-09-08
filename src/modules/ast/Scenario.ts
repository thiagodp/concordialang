import { Node, NamedNode, ContentNode } from './Node';

// SCENARIO
//
// Example 1:
// ```
// Scenario: successful login
//      Given that I can see the login screen
//      When I inform a username and a password
//          And active the option "Enter"
//      Then I see "Welcome"
//          And I am in the main screen
// ```
//

export interface Scenario extends NamedNode {
    description?: string;
    sentences: Array< ScenarioSentence >;
}

export interface ScenarioSentence extends ContentNode {
    type: 'given' | 'when' | 'then' | 'and' | 'but';
}

export interface GivenNode extends ScenarioSentence {
    type: 'given';
}

export interface WhenNode extends ScenarioSentence {
    type: 'when';
}

export interface ThenNode extends ScenarioSentence {
    type: 'then';
}

export interface AndNode extends ScenarioSentence {
    type: 'and';
}

export interface ButNode extends ScenarioSentence {
    type: 'but';
}