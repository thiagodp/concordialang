import { NodeAnalyzer } from './NodeAnalyzer';
import { Import } from "../ast/Import";
import { ASTContext } from "./ASTContext";
import { SemanticException } from './SemanticException';

export class ImportAnalyzer implements NodeAnalyzer< Import > {

    /** @inheritDoc */
    public analyze( current: Import, context: ASTContext, errors: Array< SemanticException > ): void {
        
        // Detect repeated imports
        if ( context.document.imports.includes( current.content ) ) {
            let e =  new SemanticException( 'Repeated import for file "' + current.content + '".',
                current.location );
            errors.push( e );
        }
    }

}