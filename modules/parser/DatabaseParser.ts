import { Database } from '../ast/Database';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';

/**
 * Database parser
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseParser implements NodeParser< Database > {

    analyze(
        node: Database,
        context: ParsingContext,
        it: NodeIterator,
        errors: Error[]
    ): boolean {

        // Adjusts the context
        context.resetInValues();
        context.currentDatabase = node;

        // Checks the structure
        if ( ! context.doc.databases ) {
            context.doc.databases = [];
        }

        // Adds the node
        context.doc.databases.push( node );

        return true;
    }

}