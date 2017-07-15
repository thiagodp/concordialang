import { Scenario } from './Scenario';
import { Rule } from "./Rule";
import { Node } from './Node';

// Feature example 1:
// ```
// Feature: Login
//   As an administrator
//   I would like to login
//   So that I can access the system
// ```
//
// Feature example 2:
// ```
// Feature: Login
//   In order to access the system
//   As an administrator
//   I would like to login
// ```

export interface Feature extends Node {

    name: string;
    description?: string;
    tags: Array< string >;

    scenarios: Array< Scenario >;
    rules: Array< Rule >;
}