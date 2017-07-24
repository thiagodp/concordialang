import { NamedASTNode } from './ASTNode';

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

export interface Constant extends NamedASTNode {
    value: string;
}