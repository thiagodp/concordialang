import { ASTNode } from './ASTNode';

// Example 1:
// ```
// Contants:
//    - "PI" is 3.14159
//    - "CompanyName" is "ACME"
// ```
//

export interface ContantsBlock extends ASTNode {
    contants: Array< Constant >;
}

export interface Constant extends ASTNode {
    name: string;
    value: string;
}