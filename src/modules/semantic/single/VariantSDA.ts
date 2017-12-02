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
 * Variant analyzer for a single document.
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

            const importsCount = doc.imports ? doc.imports.length : 0;

            // No imported files -> error
            if ( importsCount < 1 ) {
                let firstVariant = doc.variants[ 0 ];
                let msg = 'No imports or feature declared before the variant.';
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

        } else if ( doc.feature ) {
            let availableFeatures: Feature[] = [ doc.feature ];
            let availableFeatureNames: string[] = [ doc.feature.name.toLowerCase() ];
            let availableFeaturePaths: string[] = [ doc.fileInfo.path ];
            for ( let variant of doc.feature.variants ) {
                this.checkTags(
                    spec,
                    doc,
                    variant,
                    availableFeatures,
                    availableFeatureNames,
                    availableFeaturePaths,
                    errors
                );
            }
        }

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

        this.copyVariantsToFeature( doc.variants, feature, docImport.value );
        return true;
    }


    private featureFromImport( spec: Spec, docImport: Import, errors: Error[] ): Feature {
        
        // Gets the imported document
        const filePath = docImport.value;
        const importedDoc: Document = spec.docWithPath( filePath );

        if ( ! importedDoc ) {
            let msg = 'Imported document path not resolved: "' + filePath + '".';
            let err = new SemanticException( msg, docImport.location );
            errors.push( err );
            return null;
        }

        return importedDoc.feature;
    }


    private processMultipleImports( spec: Spec, doc: Document, errors: Error[] ): boolean {

        // Sanity checking
        if ( 0 === doc.imports.length ) {
            return false;
        }

        // Gets available features
        let availableFeatures: Feature[] = [];
        let availableFeatureNames: string[] = [];
        let availableFeaturePaths: string[] = [];
        for ( let docImport of doc.imports ) {
            let feature = this.featureFromImport( spec, docImport, errors );
            if ( feature ) {
                availableFeatures.push( feature );
                availableFeatureNames.push( feature.name.toLowerCase() ); // Lower case
                availableFeaturePaths.push( docImport.value );
            }
        }

        // Checks the number of available features
        if ( 0 === availableFeatures.length ) {
            let msg = 'None of the imported files has features.';
            let err = new SemanticException( msg, doc.imports[ 0 ].location );
            errors.push( err );            
            return false;
        }

        // Each variant must have a tag that references a feature
        // and the feature must exist in the imported files

        for ( let variant of doc.variants ) {
            this.checkTags(
                spec,
                doc,
                variant,
                availableFeatures,
                availableFeatureNames,
                availableFeaturePaths,
                errors
            );
        }    

        return true;
    }


    private copyVariantsToFeature( variants: Variant[], feature: Feature, filePath: string ) {

        // Sanity checking
        if ( ! variants || variants.length < 1 ) {
            return;
        }

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


    private checkTags(
        spec: Spec,
        doc: Document,
        variant: Variant,
        availableFeatures: Feature[],
        availableFeatureNames: string[],
        availableFeaturePaths: string[],
        errors: Error[]
    ) {
        // Sanity checking
        if ( ! variant.tags ) {
            variant.tags = [];
        }

        const singleFeature: boolean = 1 === availableFeatures.length;

        // A variant must have a reference to a feature (since no feature is declared in the file).
        // The referenced feature must exist in a imported file.

        let featureName: string = null;
        let featureTag: Tag = null;

        for ( let tag of variant.tags ) {
            // Found a tag @feature ? -> get the feature name
            if ( tag.name === ReservedTags.FEATURE ) {
                featureTag = tag;
                featureName = tag.content;
                break;
            }
        }

        if ( singleFeature ) {
            if ( ! featureName ) {
                // Considers the available one
                featureName = availableFeatureNames[ 0 ];
            }
            // continue to check the feature
        } else { // multiple features
            if ( ! featureName ) {
                let msg = 'Variant has no tag referencing a feature.';
                let err = new SemanticException( msg, variant.location );
                errors.push( err );
                return false;
            }
            // continue to check the feature
        }

        featureName = featureName.toLowerCase();
        // Not available -> error
        const featureIndex = availableFeatureNames.indexOf( featureName );
        if ( featureIndex < 0 ) {
            let msg = 'Variant tag references a non existing feature.';
            let err = new SemanticException( msg, featureTag.location );
            errors.push( err );
            return false;
        }

        let feature = availableFeatures[ featureIndex ];
        let featureFilePath = availableFeaturePaths[ featureIndex ];

        if ( spec.basePath ) {
            // Normalizes the path, according to the base path
            featureFilePath = path.join( spec.basePath, featureFilePath );
        }

        // Copy variants from the document to the feature and sets the filePath of each one.        
        this.copyVariantsToFeature( doc.variants, feature, featureFilePath );         

        return true;
    }

}