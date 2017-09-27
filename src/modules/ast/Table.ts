import { Node } from './Node';

export interface Table extends Node {
    rows: TableRow[];
}

export interface TableRow extends Node {
    cells: TableCell[];
}

export interface TableCell extends Node {
    value: string | number | boolean;
}