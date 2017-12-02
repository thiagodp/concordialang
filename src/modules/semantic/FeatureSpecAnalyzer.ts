import { Document } from '../ast/Document';
import { NodeBasedSpecAnalyzer } from "./NodeBasedSpecAnalyzer";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";
import { DuplicationChecker } from "../util/DuplicationChecker";
import { Feature } from "../ast/Feature";
import { SemanticException } from './SemanticException';

/**
 * Feature semantic analyzer.
 * 
 * Checkings:
 * - duplicated features
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureSpecAnalyzer implements NodeBasedSpecAnalyzer {

     /** @inheritDoc */
    public analyze( spec: Spec, errors: LocatedException[] ) {
        this.checkForDuplicatedFeatureNames( spec, errors );
    }

    private checkForDuplicatedFeatureNames( spec: Spec, errors: LocatedException[] ) {
        
        let items: Feature[] = [];
        for ( let doc of spec.docs ) {
            if ( doc.feature ) {
                items.push( doc.feature );
            }
        }       
        
        const duplicated = ( new DuplicationChecker() )
            .withDuplicatedProperty( items, 'name' );

        for ( let dup of duplicated ) {
            let msg = 'Duplicated feature "' + dup.name + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );             
        }  
    }
}