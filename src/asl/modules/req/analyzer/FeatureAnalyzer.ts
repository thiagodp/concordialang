import { Feature } from '../ast/Feature';
import { NodeAnalyzer } from './NodeAnalyzer';
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { Spec } from '../ast/Spec';
import { LocatedException } from "../LocatedException";
import { SemanticException } from './SemanticException';
import { Keywords } from "../Keywords";

export class FeatureAnalyzer extends NodeAnalyzer< Feature > {

    /** @inheritDoc */
    public analyzeNodes(
        current: Feature,
        nodes: Array< Node >,
        doc: Document,
        errors: Array< LocatedException >,
        stopAtFirstError: boolean
    ): void {
        // Just one feature per file
        if ( doc.features.length > 1 ) {
            let err =  new SemanticException( 'Each file must have just one feature.',
                current.location );
            errors.push( err );
        }
    }

    /** @inheritDoc */
    public analyzeDocuments(
        current: Feature,
        spec: Spec,
        errors: LocatedException[],
        stopAtFirstError: boolean
    ): void {
        // TO-DO: analyze duplicated names in the spec
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