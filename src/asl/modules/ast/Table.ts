import { Node } from './Node';

export interface TableCell extends Node {
    value: string | number | boolean;
}

export interface TableRow extends Node {
    cells: Array< TableCell >;
}

export interface Table extends Node {
    rows: Array< TableRow >;
}