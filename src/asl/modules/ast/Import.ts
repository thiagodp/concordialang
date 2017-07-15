import { Node } from './Node';

export interface Import extends Node {
    file: string;
}