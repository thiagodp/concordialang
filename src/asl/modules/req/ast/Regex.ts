import { ASTNode } from './ASTNode';

// Example:
// ```
// Regex "Person Name": /[A-Za-z][A-Za-z '-.]{1,59}/
// ```
//
export interface Regex extends ASTNode {
    name: string;
    content: string;
}