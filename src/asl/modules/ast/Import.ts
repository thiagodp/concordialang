import { ASTNode } from './ASTNode';

export interface Import extends ASTNode {
    file: string;
}