"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantGivenStepDA = void 0;
const nlp_1 = require("../../nlp");
const TypeChecking_1 = require("../../util/TypeChecking");
const NodeTypes_1 = require("../../req/NodeTypes");
const SemanticException_1 = require("../SemanticException");
/**
 * Variant's Given step analyzer for a single document.
 *
 * Checkings:
 *  - Given steps cannot appear after other steps.
 *  - Given steps with state must be the declared before other Given steps.
 *
 * @author Thiago Delgado Pinto
 */
class VariantGivenStepDA {
    constructor() {
        this._nlpUtil = new nlp_1.NLPUtil();
    }
    analyze(doc, errors) {
        if (!doc.feature) {
            return;
        }
        // Feature's Variant Background
        if (TypeChecking_1.isDefined(doc.feature.variantBackground)) {
            this.analyzeGivenSteps(doc.feature.variantBackground.sentences, errors);
        }
        for (let scenario of doc.feature.scenarios || []) {
            // Scenario's Variant Background
            if (TypeChecking_1.isDefined(scenario.variantBackground)) {
                this.analyzeGivenSteps(scenario.variantBackground.sentences, errors);
            }
            // Scenario's Variants
            for (let variant of scenario.variants || []) {
                this.analyzeGivenSteps(variant.sentences, errors);
            }
        }
    }
    analyzeGivenSteps(steps, errors) {
        let lastWasGiven = null;
        let index = 0, preconditionsCount = 0;
        for (let step of steps || []) {
            if (NodeTypes_1.NodeTypes.STEP_GIVEN === step.nodeType) {
                // Check if the Given step appears after other step type
                if (false === lastWasGiven) {
                    const msg = 'A Given step cannot be declared after other step than Given.';
                    const err = new SemanticException_1.SemanticException(msg, step.location);
                    errors.push(err);
                }
                lastWasGiven = true;
                // Check state
                if (this.hasState(step)) {
                    if (preconditionsCount < index) {
                        errors.push(this.makeStateError(step));
                    }
                    preconditionsCount++;
                }
            }
            else if (NodeTypes_1.NodeTypes.STEP_AND === step.nodeType) {
                // Check state
                if (lastWasGiven && this.hasState(step)) {
                    if (preconditionsCount < index) {
                        errors.push(this.makeStateError(step));
                    }
                    preconditionsCount++;
                }
            }
            else {
                lastWasGiven = false;
            }
            ++index;
        }
    }
    hasState(step) {
        return this._nlpUtil.hasEntityNamed(nlp_1.Entities.STATE, step.nlpResult);
    }
    makeStateError(step) {
        const msg = 'Given steps with state must be declared before other Given steps.';
        return new SemanticException_1.SemanticException(msg, step.location);
    }
}
exports.VariantGivenStepDA = VariantGivenStepDA;
