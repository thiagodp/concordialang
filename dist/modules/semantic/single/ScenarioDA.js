import { SemanticException } from "../../error/SemanticException";
import { DuplicationChecker } from "../DuplicationChecker";
/**
 * Analyzes Scenario declarations for a single document.
 *
 * It checks for:
 *  - Duplicated scenario names
 *
 * @author Thiago Delgado Pinto
 */
export class ScenarioDA {
    /** @inheritDoc */
    analyze(doc, errors) {
        // Checking the document structure
        if (!doc.feature) {
            return; // nothing to do
        }
        if (!doc.feature.scenarios) {
            doc.feature.scenarios = [];
            return; // nothing to do
        }
        this.checkForDuplicatedScenarios(doc, errors);
    }
    checkForDuplicatedScenarios(doc, errors) {
        let duplicated = (new DuplicationChecker())
            .withDuplicatedProperty(doc.feature.scenarios, 'name');
        for (let dup of duplicated) {
            let msg = 'Duplicated scenario "' + dup.name + '".';
            let err = new SemanticException(msg, dup.location);
            errors.push(err);
        }
    }
}
