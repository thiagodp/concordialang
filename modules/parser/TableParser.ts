import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { Table } from "../ast/Table";
import { convertCase } from "../util/CaseConversor";
import { CaseType } from "../app/CaseType";

/**
 * Table parser
 *
 * @author Thiago Delgado Pinto
 */
export class TableParser implements NodeParser< Table > {

    /** @inheritDoc */
    public analyze( node: Table, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks the structure
        if ( ! context.doc.tables ) {
            context.doc.tables = [];
        }

        // Generates the internal name
        node.internalName = convertCase( node.name, CaseType.SNAKE );

        // Adjusts the content
        context.resetInValues();
        context.inTable = true;
        context.currentTable = node;

        // Adds the node
        context.doc.tables.push( node );

        return true;
    }

}