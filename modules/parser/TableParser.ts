import { CaseType } from "../util/CaseType";
import { Table } from "../ast/Table";
import { convertCase, removeDiacritics } from "../util/case-conversor";
import { NodeIterator } from './NodeIterator';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";

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
        node.internalName = removeDiacritics( convertCase( node.name, CaseType.SNAKE ) );

        // Adjusts the content
        context.resetInValues();
        context.inTable = true;
        context.currentTable = node;

        // Adds the node
        context.doc.tables.push( node );

        return true;
    }

}
