import { NodeSA } from './NodeSA';
import { Scenario } from '../../ast/Scenario';
import { LocatedException } from '../../req/LocatedException';
import { Document } from '../../ast/Document';
import { DuplicationChecker } from "../../util/DuplicationChecker";
import { SemanticException } from "../SemanticException";

/**
 * Scenario semantic analyzer.
 * 
 * @author Thiago Delgado Pinto
 */
export class ScenarioSA implements NodeSA {

    /** @inheritDoc */
    public analyze( doc: Document, errors: LocatedException[] ) {

        // Some checkings
        if ( ! doc.feature ) {
            return;
        }
        if ( ! doc.feature.scenarios ) {
            doc.feature.scenarios = [];
            return;
        }

        // Check duplicated scenarios
        let duplicated: Scenario[] = ( new DuplicationChecker() )
            .withDuplicatedProperty( doc.feature.scenarios, 'name' );
        for ( let dup of duplicated ) {
            let msg = 'Duplicated scenario "' + dup.name + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );             
        }

    }

}