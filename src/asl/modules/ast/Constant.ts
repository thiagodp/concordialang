import { Node } from './Node';

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

export interface Constant extends Node {
    name: string;
    value: string;
}