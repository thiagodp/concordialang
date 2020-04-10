"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SemanticException_1 = require("../../error/SemanticException");
const DuplicationChecker_1 = require("../DuplicationChecker");
/**
 * Analyzes Scenario declarations for a single document.
 *
 * It checks for:
 *  - Duplicated scenario names
 *
 * @author Thiago Delgado Pinto
 */
class ScenarioDA {
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
        let duplicated = (new DuplicationChecker_1.DuplicationChecker())
            .withDuplicatedProperty(doc.feature.scenarios, 'name');
        for (let dup of duplicated) {
            let msg = 'Duplicated scenario "' + dup.name + '".';
            let err = new SemanticException_1.SemanticException(msg, dup.location);
            errors.push(err);
        }
    }
}
exports.ScenarioDA = ScenarioDA;
