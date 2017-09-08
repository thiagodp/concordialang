import { Scenario } from './Scenario';
import { TestCase } from './TestCase';
import { Rule } from "./Rule";
import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';

// FEATURE
//
// Example 1:
// ```
// Feature: Login
//   As an administrator
//   I would like to login
//   So that I can access the system
// ```
//
// Example 2:
// ```
// Feature: Login
//   In order to access the system
//   As an administrator
//   I would like to login
// ```

/**
 * Feature node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Feature extends NamedNode, MayHaveTags {

    description?: string;

    scenarios?: Array< Scenario >;

    testcases?: Array< TestCase >;

    rules?: Array< Rule >;
}