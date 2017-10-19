import { Database } from '../ast/DataSource';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { NodeIterator } from './NodeIterator';

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

        context.currentDatabase = node;

        // Adjust the context
        context.resetInValues();
        
        return true;
    }

}