import { Node, NamedNode, ContentNode } from './Node';
import { Step } from './Step';

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
    sentences: Array< Step >;
}