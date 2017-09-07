import { Import } from '../ast/Import';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../SyntaticException";

/**
 * Import parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportParser implements NodeParser< Import > {

    /** @inheritDoc */
    public analyze(
        node: Import,
        context: ParsingContext,
        it: NodeIterator,
        errors: Error[]
    ): boolean {

        // Checks if a feature is declared before it
        if ( context.doc.feature ) {
            let e = new SyntaticException( 'An import must be declared before a feature.', node.location );
            errors.push( e );
            return false;
        }

        // Add the import node to the document
        if ( ! context.doc.imports ) {
            context.doc.imports = [];
        }
        context.doc.imports.push( node );

        return true;
    }
}