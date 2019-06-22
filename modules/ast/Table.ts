import { Node, NamedNode } from './Node';

/**
 * Table node.
 *
 * @author Thiago Delgado Pinto
 */
export interface Table extends NamedNode {

    /** Name converted to snake_case, generated when parsed */
    internalName: string;

    rows: TableRow[];
}

/**
 * Table row node.
 *
 * @author Thiago Delgado Pinto
 */
export interface TableRow extends Node {
    cells: string[];
}