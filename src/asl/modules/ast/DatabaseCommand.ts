import { ASTNode } from './ASTNode';

export interface DatabaseCommand extends ASTNode {
    type: 'query' | 'command';
    name: string;
    command: string;
    databaseName: string;
}