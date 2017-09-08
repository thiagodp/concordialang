import { MayHaveTags } from './Tag';
import { Scenario } from "./Scenario";

// TEST CASE
//
// Example 1:
// ```
// Test case for "some interaction": successful login
//      Given that I am on page "http://127.0.0.1"
//          And I see in the url "/login"
//      When I fill "#username" with "Bob"
//          And I fill "#password" with "bobp4ss"
//          And I click "Enter"
//      Then I see "Welcome"
//          And I don't see in current url "/login"
// ```
//
// Example 2:
// ```
// Test case: successful login
//      ...
// ```
//

export interface TestCase extends Scenario, MayHaveTags {
    scenarioName?: string;
}