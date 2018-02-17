import { DocAnalyzer } from './DocAnalyzer';
import { Scenario } from '../../ast/Scenario';
import { Document } from '../../ast/Document';
import { DuplicationChecker } from "../../util/DuplicationChecker";
import { SemanticException } from "../SemanticException";

/**
 * Scenario analyzer for a single document.
 * 
 * Checkings:
 *  - Duplicated scenario names
 * 
 * @author Thiago Delgado Pinto
 */
export class ScenarioDA implements DocAnalyzer {

    /** @inheritDoc */
    public analyze( doc: Document, errors: SemanticException[] ) {

        // Checking the document structure
        if ( ! doc.feature ) {
            return; // nothing to do
        }
        if ( ! doc.feature.scenarios ) {
            doc.feature.scenarios = [];
            return; // nothing to do
        }

        this.checkForDuplicatedScenarios( doc, errors );
    }

    private checkForDuplicatedScenarios( doc: Document, errors: SemanticException[] ) {
        let duplicated: Scenario[] = ( new DuplicationChecker() )
            .withDuplicatedProperty( doc.feature.scenarios, 'name' );
        for ( let dup of duplicated ) {
            let msg = 'Duplicated scenario "' + dup.name + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );             
        }        
    }

}