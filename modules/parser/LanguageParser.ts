import { Language } from 'concordialang-types/ast';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';

/**
 * Language parser
 *
 * @author Thiago Delgado Pinto
 */
export class LanguageParser implements NodeParser< Language > {

    /** @inheritDoc */
    public analyze( node: Language, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if it is already declared
        if ( context.doc.language ) {
            let e = new SyntaticException( 'Just one language declaration is allowed.', node.location );
            errors.push( e );
            return false;
        }

        // Checks if an import is declared before it
        if ( context.doc.imports && context.doc.imports.length > 0 ) {
            let e = new SyntaticException( 'The language must be declared before an import.', node.location );
            errors.push( e );
            return false;
        }

        // Checks if a feature is declared before it
        if ( context.doc.feature ) {
            let e = new SyntaticException( 'The language must be declared before a feature.', node.location );
            errors.push( e );
            return false;
        }

        context.doc.language = node;

        return true;
    }

}