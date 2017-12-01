import { ReservedTags } from '../../req/ReservedTags';
import { NodeBasedSDA } from './NodeBasedSDA';
import { Scenario } from '../../ast/Scenario';
import { LocatedException } from '../../req/LocatedException';
import { Document } from '../../ast/Document';
import { DuplicationChecker } from "../../util/DuplicationChecker";
import { SemanticException } from "../SemanticException";

/**
 * Variant single document analyzer.
 * 
 * Checkings:
 *  - Variants have a feature
 *  - Duplicated variant names
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantSDA implements NodeBasedSDA {

    /** @inheritDoc */
    public analyze( doc: Document, errors: LocatedException[] ) {

        // Check if variants have a feature
        if ( doc.variants && doc.variants.length > 0 ) {            

            // A feature is declared -> variants were declared BEFORE it
            if ( doc.feature ) {
                let firstVariant = doc.variants[ 0 ];
                let msg = 'Variant declared before the feature.';
                let err = new SemanticException( msg, firstVariant.location );
                errors.push( err );

            // No feature declared -> check imported files
            } else {
                const importsCount = doc.imports ? doc.imports.length : 0;
                // No imports
                if ( importsCount < 1 ) {
                    let firstVariant = doc.variants[ 0 ];
                    let msg = 'No imports declared before the variant.';
                    let err = new SemanticException( msg, firstVariant.location );
                    errors.push( err );            

                // Single import
                } else if ( 1 == importsCount ) {
                    // It must have a feature

                // Multiple imports
                } else {
                    // Each variant must have a tag that references a feature
                    // and the feature must exist in imported files
                    for ( let v of doc.variants ) {
                        let featureName: string = null;
                        for ( let tag of v.tags ) {
                            // Has a tag @feature ? -> get the feature name
                            if ( tag.name === ReservedTags.FEATURE ) {
                                featureName = tag.content;
                            }
                        }
                        if ( ! featureName ) {
                            let msg = 'Variant has no reference to a feature.';
                            let err = new SemanticException( msg, v.location );
                            errors.push( err );
                        } else {
                            // Check if the feature is declared in a imported file
                        }
                    }
                }
            }

            

        } // else has nothing to do

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

    private checkForDuplicatedScenarios( doc: Document, errors: LocatedException[] ) {
        let duplicated: Scenario[] = ( new DuplicationChecker() )
            .withDuplicatedProperty( doc.feature.scenarios, 'name' );
        for ( let dup of duplicated ) {
            let msg = 'Duplicated scenario "' + dup.name + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );
        }        
    }

}