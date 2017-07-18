import { ASTNode } from './ASTNode';

export interface TableCell extends ASTNode {
    value: string | number | boolean;
}

export interface TableRow extends ASTNode {
    cells: Array< TableCell >;
}

export interface Table extends ASTNode {
    rows: Array< TableRow >;
}