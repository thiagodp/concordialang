import { DocumentAnalyzer } from "./DocumentAnalyzer";
import { Document } from '../../ast/Document';
import { SemanticException } from "../SemanticException";
import { Step } from "../../ast/Step";
import { isDefined } from "../../util/TypeChecking";
import { NodeTypes } from "../../req/NodeTypes";
import { NLPUtil } from "../../nlp/NLPResult";
import { Entities } from "../../nlp/Entities";

/**
 * Variant's Given step analyzer for a single document.
 *
 * Checkings:
 *  - Given steps cannot appear after other steps.
 *  - Given steps with state must be the declared before other Given steps.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantGivenStepDA implements DocumentAnalyzer {

    private readonly _nlpUtil = new NLPUtil();

    analyze( doc: Document, errors: SemanticException[] ) {
        if ( ! doc.feature ) {
            return;
        }

        // Feature's Variant Background
        if ( isDefined( doc.feature.variantBackground ) ) {
            this.analyzeGivenSteps( doc.feature.variantBackground.sentences, errors );
        }

        for ( let scenario of doc.feature.scenarios || [] ) {

            // Scenario's Variant Background
            if ( isDefined( scenario.variantBackground ) ) {
                this.analyzeGivenSteps( scenario.variantBackground.sentences, errors );
            }

            // Scenario's Variants
            for ( let variant of scenario.variants || [] ) {
                this.analyzeGivenSteps( variant.sentences, errors );
            }
        }
    }

    analyzeGivenSteps( steps: Step[], errors: SemanticException[] ) {
        let lastWasGiven: boolean | null = null;
        let index = 0, preconditionsCount = 0;
        for ( let step of steps || [] ) {

            if ( NodeTypes.STEP_GIVEN === step.nodeType ) {

                // Check if the Given step appears after other step type
                if ( false === lastWasGiven ) {
                    const msg = 'A Given step cannot be declared after other step than Given.';
                    const err = new SemanticException( msg, step.location );
                    errors.push( err );
                }

                lastWasGiven = true;

                // Check state
                if ( this.hasState( step ) ) {

                    if ( preconditionsCount < index ) {
                        errors.push( this.makeStateError( step ) );
                    }

                    preconditionsCount++;
                }

            } else if ( NodeTypes.STEP_AND === step.nodeType ) {

                // Check state
                if ( lastWasGiven && this.hasState( step ) ) {

                    if ( preconditionsCount < index ) {
                        errors.push( this.makeStateError( step ) );
                    }

                    preconditionsCount++;
                }

            } else {
                lastWasGiven = false;
            }

            ++index;
        }
    }


    hasState( step: Step ): boolean {
        return this._nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );
    }

    makeStateError( step: Step ): SemanticException {
        const msg = 'Given steps with state must be declared before other Given steps.';
        return new SemanticException( msg, step.location );
    }

}