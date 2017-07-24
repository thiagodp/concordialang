import { NamedASTNode } from './ASTNode';

export interface DatabaseCommand extends NamedASTNode {
    type: 'query' | 'command';
    command: string;
    databaseName: string;
}