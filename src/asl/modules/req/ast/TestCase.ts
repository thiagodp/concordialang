import { Scenario } from "./Scenario";

// TEST CASE
//
// Example 1:
// ```
// Test case for "some scenario": successful login
//      Given that I can see the login screen
//      When I inform a username and a password
//          And active the option "Enter"
//      Then I see "Welcome"
//          And I am in the main screen
// ```
//

export interface TestCase extends Scenario {
    scenarioName?: string;
}