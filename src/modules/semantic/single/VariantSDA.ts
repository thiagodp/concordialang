import { Import } from '../../ast/Import';
import { Spec } from '../../ast/Spec';
import { ReservedTags } from '../../req/ReservedTags';
import { NodeBasedSDA } from './NodeBasedSDA';
import { Scenario } from '../../ast/Scenario';
import { LocatedException } from '../../req/LocatedException';
import { Document } from '../../ast/Document';
import { DuplicationChecker } from "../../util/DuplicationChecker";
import { SemanticException } from "../SemanticException";
import { Feature } from '../../ast/Feature';
import { Tag } from '../../ast/Tag';
import { Variant } from '../../ast/Variant';

import * as path from 'path';

/**
 * Variant single document analyzer.
 * 
 * Checkings:
 *  - If variants have a feature
 *  - Duplicated variant names
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantSDA implements NodeBasedSDA {

    /** @inheritDoc */
    public analyze( spec: Spec, doc: Document, errors: LocatedException[] ) {

        // Check if variants have a feature
        if ( doc.variants && doc.variants.length > 0 ) {            

            // A feature is declared, so variants were declared BEFORE it -> Error
            if ( doc.feature ) {
                let firstVariant = doc.variants[ 0 ];
                let msg = 'Variant declared before the feature.';
                let err = new SemanticException( msg, firstVariant.location );
                errors.push( err );

            // No feature is declared -> let's check imported files
            } else {
                const importsCount = doc.imports ? doc.imports.length : 0;

                // No imported files -> error
                if ( importsCount < 1 ) {
                    let firstVariant = doc.variants[ 0 ];
                    let msg = 'No imports declared before the variant.';
                    let err = new SemanticException( msg, firstVariant.location );
                    errors.push( err );            

                // Single import -> Let's check its feature
                } else if ( 1 == importsCount ) {
                    const singleImport = doc.imports[ 0 ];
                    this.processSingleImport( spec, doc, singleImport, errors );

                // Multiple imports -> Let's check referenced features
                } else {
                    this.processMultipleImports( spec, doc, errors );
                }
            }

        } // else has nothing to do

        // Checking the document structure
        if ( ! doc.feature || ! doc.feature.variants || doc.feature.variants.length < 1 ) {
            return; // nothing to do
        }

        this.checkForDuplicatedVariants( doc, errors );
    }

    private checkForDuplicatedVariants( doc: Document, errors: LocatedException[] ) {

        let duplicated: Variant[] = ( new DuplicationChecker() )
            .withDuplicatedProperty( doc.feature.variants, 'name' );

        for ( let dup of duplicated ) {
            let msg = 'Duplicated variant "' + dup.name + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );
        }        
    }


    private processSingleImport( spec: Spec, doc: Document, docImport: Import, errors: Error[] ): boolean {

        let feature = this.featureFromImport( spec, docImport, errors );
        // It must have a feature
        if ( ! feature ) {
            let msg = 'Imported document does not have a feature.';
            let err = new SemanticException( msg, docImport.location );
            errors.push( err );
            return false;
        }

        this.addVariantsToFeature( doc.variants, feature, docImport.value );
        return true;
    }


    private featureFromImport( spec: Spec, docImport: Import, errors: Error[] ): Feature {
        
        // Gets the imported document
        const filePath = docImport.value;
        const importedDoc = spec.docWithPath( filePath );

        if ( ! importedDoc ) {
            let msg = 'Imported path not resolved to find a variant\'s feature.';
            let err = new SemanticException( msg, docImport.location );
            errors.push( err );
            return null;
        }

        return importedDoc.feature;
    }

    private processMultipleImports( spec: Spec, doc: Document, errors: Error[] ): boolean {

        // Get available features
        let availableFeatures: Feature[] = [];
        let availableFeatureNames: string[] = [];
        let availablePaths: string[] = [];
        for ( let docImport of doc.imports ) {
            let feature = this.featureFromImport( spec, docImport, errors );
            if ( feature ) {
                availableFeatures.push( feature );
                availableFeatureNames.push( feature.name.toLowerCase() ); // Lower case
                availablePaths.push( docImport.value );
            }
        }

        // Each variant must have a tag that references a feature
        // and the feature must exist in imported files

        for ( let variant of doc.variants ) {

            // A variant must have a reference to a feature (since no feature is declared in the file).
            // The reference feature must exist in a imported file.

            let featureName: string = null;
            let featureTag: Tag = null;
            for ( let tag of variant.tags ) {
                // Has a tag @feature ? -> get the feature name
                if ( tag.name === ReservedTags.FEATURE ) {
                    featureTag = tag;
                    featureName = tag.content;
                    break;
                }
            }
            if ( ! featureName ) {
                let msg = 'Variant has no reference to a feature.';
                let err = new SemanticException( msg, variant.location );
                errors.push( err );
                continue;
            }
            featureName = featureName.toLowerCase();

            // Not available -> error
            const featureIndex = availableFeatureNames.indexOf( featureName );
            if ( featureIndex < 0 ) {
                let msg = 'Variant referenced a non existing feature.';
                let err = new SemanticException( msg, featureTag.location );
                errors.push( err );
                continue;
            }

            // Copy variants from the document to the feature and sets the filePath of each one.
            const feature = availableFeatures[ featureIndex ];
            let filePath = availablePaths[ featureIndex ];
            if ( spec.basePath ) {
                // Normalizes the path, according to the base path
                filePath = path.join( spec.basePath, filePath );
            }
            this.addVariantsToFeature( doc.variants, feature, filePath );
        }

        return true;
    }


    private addVariantsToFeature( variants: Variant[], feature: Feature, filePath: string ) {

        if ( ! feature.variants ) {
            feature.variants = [];
        }

        let variantsClone = variants.slice( 0 );
        for ( let variant of variantsClone ) {
            // Sets the variant's file Path
            variant.location.filePath = filePath; // <<< External file path!
            // Add it to the feature
            feature.variants.push( variant );
        }
    }

}