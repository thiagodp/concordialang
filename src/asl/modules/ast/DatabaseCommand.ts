import { Node } from './Node';

export interface DatabaseCommand extends Node {
    type: 'query' | 'command';
    name: string;
    command: string;
    databaseName: string;
}