import { Node } from './Node';

export interface Table extends Node {
    rows: Array< TableRow >;
}

export interface TableRow extends Node {
    cells: Array< TableCell >;
}

export interface TableCell extends Node {
    value: string | number | boolean;
}