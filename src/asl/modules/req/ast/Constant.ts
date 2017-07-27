import { Node, NamedNode } from './Node';

// CONSTANTS
//
// Example 1:
// ```
// Contants:
//    - "PI" is 3.14159
//    - "CompanyName" is "ACME"
// ```
//

export interface ContantsBlock extends Node {
    contants: Array< Constant >;
}

export interface Constant extends NamedNode {
    value: string;
}