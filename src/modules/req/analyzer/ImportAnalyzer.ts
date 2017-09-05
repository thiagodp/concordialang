import { Import } from '../old_ast/Import';
import { NodeAnalyzer } from './NodeAnalyzer';
import { Node } from '../old_ast/Node';
import { Document } from '../old_ast/Document';
import { Feature } from '../old_ast/Feature';
import { Spec } from '../old_ast/Spec';
import { Keywords } from '../Keywords';
import { LocatedException } from '../LocatedException';
import { SemanticException } from './SemanticException';

export class ImportAnalyzer extends NodeAnalyzer< Import > {

    /** @inheritDoc */
    public analyzeNodes(
        nodes: Array< Node >,
        stopAtFirstError: boolean
    ): Array< LocatedException > {
        let errors: Array< LocatedException > = [];
        this.detectForbiddenPriorDeclarations( Keywords.IMPORT, errors );

        let filtered = this.filterNodesByKeyword( nodes, Keywords.IMPORT );
        let duplicates = this.duplicates( filtered );
        

        // Detect duplicated imports
        if ( this.hasDuplication( this.filterNodesByKeyword( nodes, Keywords.IMPORT ), 'content' ) ) {
            let e =  new SemanticException( 'Repeated import for file "' + current.content + '".',
                current.location );
            errors.push( e );
        }
        return errors;
    }

    /** @inheritDoc */
    public analyzeDocuments(
        current: Import,
        spec: Spec,
        errors: Array< LocatedException >,
        stopAtFirstError: boolean
    ): void {
        // TO-DO: analyze if the imported file exists
        // TO-DO: analyze cycles
    }

    /** @inheritDoc */
    public forbiddenPriorKeywords(): string[] {
        return [
            Keywords.COMMENT,
            Keywords.TAG,
            Keywords.IMPORT
        ];
    }

}