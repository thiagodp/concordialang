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
 * - duplicated names
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureSpecAnalyzer implements NodeBasedSpecAnalyzer {

     /** @inheritDoc */
    public analyze( spec: Spec, errors: LocatedException[] ) {
        this.checkDuplicatedNames( spec, errors );
    }

    private checkDuplicatedNames( spec: Spec, errors: LocatedException[] ) {
        
        let items = [];
        for ( let doc of spec.docs ) {
            if ( doc.feature ) {
                items.push( {
                    file: doc.fileInfo.path,
                    name: doc.feature.name,
                    location: doc.feature.location
                } );
            }
        }

        const map = ( new DuplicationChecker() ).mapDuplicates( items, 'name' );
        for ( let prop in map ) {
            let duplications = map[ prop ];
            let msg = 'Duplicated feature "' + prop + '" in: ' +
                duplications.map( item => item.file ).join( ', ' );
            let err = new SemanticException( msg, duplications[ 0 ].location );
            errors.push( err );            
        }

    }
}