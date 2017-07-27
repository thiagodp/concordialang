import { Feature } from '../ast/Feature';
import { NodeAnalyzer } from './NodeAnalyzer';
import { Document } from '../ast/Document';
import { Spec } from '../ast/Spec';
import { LocatedException } from "../LocatedException";
import { SemanticException } from './SemanticException';

export class FeatureAnalyzer implements NodeAnalyzer< Feature > {

    /** @inheritDoc */
    public analyzeInDocument(
        current: Feature,
        doc: Document,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): void {
        
        // Just one feature per file
        if ( doc.features.length > 1 ) {
            let err =  new SemanticException( 'Each file must have just one feature.',
                current.location );
            errors.push( err );
        }
    }

    /** @inheritDoc */
    public analyzeInSpec(
        current: Feature,
        spec: Spec,
        errors: LocatedException[],
        stopOnTheFirstError: boolean
    ): void {
        // TO-DO: analyze duplicated names
    }    

}