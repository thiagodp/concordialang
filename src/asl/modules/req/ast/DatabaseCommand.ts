import { NamedNode } from './Node';

export interface DatabaseCommand extends NamedNode {
    type: 'query' | 'command';
    command: string;
    databaseName: string;
}