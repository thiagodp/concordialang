import { Import } from '../ast/Import';
import { Spec } from '../ast/Spec';
import { ReservedTags } from '../req/ReservedTags';
import { Scenario } from '../ast/Scenario';
import { Document } from '../ast/Document';
import { DuplicationChecker } from "../util/DuplicationChecker";
import { SemanticException } from "./SemanticException";
import { Feature } from '../ast/Feature';
import { Tag } from '../ast/Tag';
import { Variant, TestCase } from '../ast/Variant';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { Location } from '../ast/Location';
import Graph = require( 'graph.js/dist/graph.full.js' );
import * as path from 'path';
import * as deepcopy from 'deepcopy';

/**
 * Executes semantic analysis of Test Cases in a specification.
 *
 * Checkings:
 *  - If Test Cases have a Feature:
 *    - A Test Case from a document without a Feature should:
 *      - Import a single file with a Feature OR
 *      - Import multiple files BUT have a @tag with the Feature name
 *  - Duplicated Test Case names
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseSSA extends SpecificationAnalyzer {

    constructor(
        private  _tagFeatureKeywords: string[] = [ ReservedTags.FEATURE ]
    ) {
        super();
    }

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        for ( let doc of spec.docs ) {
            this.analyzeDocument( spec, doc, errors );
        }
    }

    public analyzeDocument( spec: Spec, doc: Document, errors: SemanticException[] ) {

        // Check if variants have a feature
        if ( doc.testCases && doc.testCases.length > 0 ) {

            const importsCount = doc.imports ? doc.imports.length : 0;

            // No imported files -> error
            if ( importsCount < 1 ) {
                let firstVariant = doc.testCases[ 0 ];
                const msg = 'No imports or feature declared before the test case.';
                const err = new SemanticException( msg,
                    this.makeLocationWithPath( firstVariant.location, doc.fileInfo.path ) );
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
            for ( let testCase of doc.feature.testCases ) {
                this.checkTags(
                    spec,
                    doc,
                    testCase,
                    availableFeatures,
                    availableFeatureNames,
                    availableFeaturePaths,
                    errors
                );
            }
        }

        // Checking the document structure
        if ( ! doc.feature || ! doc.feature.testCases || doc.feature.testCases.length < 1 ) {
            return; // nothing to do
        }

        this._checker.checkDuplicatedNamedNodes( doc.feature.testCases, errors, 'Test Case' );
    }


    private processSingleImport( spec: Spec, doc: Document, docImport: Import, errors: Error[] ): boolean {

        let feature = this.featureFromImport( spec, doc, docImport, errors );
        // It must have a feature
        if ( ! feature ) {
            const msg = 'Imported document does not have a feature.';
            const err = new SemanticException( msg,
                this.makeLocationWithPath( docImport.location, doc.fileInfo.path ) );
            errors.push( err );
            return false;
        }

        this.copyTestCasesToFeature( doc.testCases, feature, docImport.value );
        return true;
    }


    private featureFromImport( spec: Spec, doc: Document, docImport: Import, errors: Error[] ): Feature {

        // Gets the imported document
        const filePath = docImport.value;
        const importedDoc: Document = spec.docWithPath( filePath, doc.fileInfo.path );

        if ( ! importedDoc ) {
            const msg = 'Imported document path not resolved: "' + filePath + '".';
            const err = new SemanticException( msg,
                this.makeLocationWithPath( docImport.location, doc.fileInfo.path ) );
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
            let feature = this.featureFromImport( spec, doc, docImport, errors );
            if ( feature ) {
                availableFeatures.push( feature );
                availableFeatureNames.push( feature.name.toLowerCase() ); // Lower case
                availableFeaturePaths.push( docImport.value );
            }
        }

        // Checks the number of available features
        if ( 0 === availableFeatures.length ) {
            const msg = 'None of the imported files has features.';
            const err = new SemanticException( msg,
                this.makeLocationWithPath( doc.imports[ 0 ].location, doc.fileInfo.path ) );
            errors.push( err );
            return false;
        }

        // Each variant must have a tag that references a feature
        // and the feature must exist in the imported files

        for ( let variant of doc.testCases ) {
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


    private copyTestCasesToFeature( testCases: TestCase[], feature: Feature, filePath: string ) {

        // Sanity checking
        if ( ! testCases || testCases.length < 1 ) {
            return;
        }

        if ( ! feature.testCases ) {
            feature.testCases = [];
        }

        let testCasesClone = testCases.slice( 0 );
        for ( let testCase of testCasesClone ) {
            // Sets the file Path
            testCase.location.filePath = filePath; // <<< External file path!
            // Adds to the feature
            feature.testCases.push( testCase );
        }
    }


    private checkTags(
        spec: Spec,
        doc: Document,
        testCases: TestCase,
        availableFeatures: Feature[],
        availableFeatureNames: string[],
        availableFeaturePaths: string[],
        errors: Error[]
    ) {
        // Sanity checking
        if ( ! testCases.tags ) {
            testCases.tags = [];
        }

        const singleFeature: boolean = 1 === availableFeatures.length;

        // A Test Case must have a reference to a Feature, since no feature is declared in the file.
        // The referenced Feature must exist in a imported file.

        let featureName: string = null;
        let featureTag: Tag = null;

        for ( let tag of testCases.tags ) {
            // Found a tag @feature ? -> get the feature name
            if ( this.isFeatureTag( tag.name ) ) {
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
                const msg = 'Test case has no tag that refers to its feature.';
                const err = new SemanticException( msg,
                    this.makeLocationWithPath( testCases.location, doc.fileInfo.path ) );
                errors.push( err );
                return false;
            }
            // continue to check the feature
        }

        featureName = featureName.toLowerCase();
        // Not available -> error
        const featureIndex = availableFeatureNames.indexOf( featureName );
        if ( featureIndex < 0 ) {
            const msg = 'Tag refers to a non existing feature.';
            const err = new SemanticException( msg,
                this.makeLocationWithPath( featureTag.location, doc.fileInfo.path ) );
            errors.push( err );
            return false;
        }

        let feature = availableFeatures[ featureIndex ];
        let featureFilePath = availableFeaturePaths[ featureIndex ];

        if ( spec.basePath ) {
            // Normalizes the path, according to the base path
            featureFilePath = path.join( spec.basePath, featureFilePath );
        }

        // Copy test cases from the document to the feature and sets the filePath of each one.
        this.copyTestCasesToFeature( doc.testCases, feature, featureFilePath );

        return true;
    }


    isFeatureTag( name: string ): boolean {
        return this._tagFeatureKeywords.indexOf( name.toLowerCase().trim() ) >= 0;
    }

    private makeLocationWithPath( location: Location, path: string ): Location {
        let loc = deepcopy( location ) as Location;
        loc.filePath = path;
        return loc;
    }

}