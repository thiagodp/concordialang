import { Document } from '../ast/Document';
import { ItemToCheck, SpecSemanticAnalyzer } from './SpecSemanticAnalyzer';
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from "../util/DuplicationChecker";
import { Feature } from "../ast/Feature";
import { SemanticException } from './SemanticException';

/**
 * Executes semantic analysis of Features in a specification.
 * 
 * Checkings:
 * - duplicated names
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureSSA extends SpecSemanticAnalyzer {

     /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
        this.analyzeDuplicatedNames( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: SemanticException[] ) {
        
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