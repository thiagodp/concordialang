import { Document } from '../ast/Document';
import { ItemToCheck, NodeBasedSpecAnalyzer } from './NodeBasedSpecAnalyzer';
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
export class FeatureSpecAnalyzer extends NodeBasedSpecAnalyzer {

     /** @inheritDoc */
    public async analyze( spec: Spec, errors: LocatedException[] ): Promise< void > {
        this.analyzeDuplicatedNames( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: LocatedException[] ) {
        
        let items: ItemToCheck[] = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.feature ) {
                continue;
            }
            let loc = doc.feature.location;
            items.push( {
                file: doc.fileInfo ? doc.fileInfo.path : '',
                name: doc.feature.name,
                locationStr: loc ? '(' + loc.line + ',' + loc.column + ') ' : ''
            } );
        }

        this.checkDuplicatedNames( items, errors, 'feature' );
    }
}