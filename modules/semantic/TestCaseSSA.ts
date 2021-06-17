import { Location } from 'concordialang-types';
import deepcopy from 'deepcopy';
import Graph from 'graph.js/dist/graph.full.js';

import { Document, Feature, Import, Tag, TestCase } from '../ast';
import { LocatedException, ProblemMapper, SemanticException } from '../error';
import { KeywordDictionary } from '../language';
import { englishKeywords } from '../language/data/en';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { isDefined } from '../util/type-checking';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';


/**
 * Analyzes Test Cases from a specification.
 *
 * It checks for:
 *
 *  - A Test Case from a document without a Feature should:
 *    - Import a single file with a Feature OR
 *    - Import multiple files BUT have a tag @feature( <name> )
 *
 *  - Duplicated Test Case names (plus the Scenario and the Variant)
 *
 *  - Tag @variant without a tag @scenario
 *
 *  - Tag @scenarios' content must be number greater than zero,
 *    and less than the number of scenarios in the feature.
 *
 *  - Tag @variant's content must be number greater than zero,
 *    and less than the number of variant in the scenario.
 *
 * It changes:
 *
 *  - Tag @generated turns the flag 'generated' to true.
 *
 *  - Tag @scenario( <index> ) changes the property 'declaredScenarioIndex'
 *    when it is a number greater than zero.
 *
 *  - Tag @variant( <index> ) changes the property 'declaredVariantIndex'
 *    when it is a number greater than zero.
 *
 *  - location.filePath is defined if not defined.
 *
 * Notes:
 *
 *   - Duplicated test case names must be checked after the changes. The name
 *     must be compared as well as the scenario and the variant.
 *
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseSSA extends SpecificationAnalyzer {

    // TODO: change it to receive a dictionary loader, according to the analyzed doc
    constructor( private _keywords?: KeywordDictionary ) {
        super();
        if ( ! this._keywords ) {
            this._keywords = englishKeywords;
        }
    }

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {
        let specOK = true;
        for ( let doc of spec.docs ) {
            let errors: SemanticException[] = [];
            this.analyzeDocument( spec, doc, errors );
            if ( errors.length > 0 ) {
                specOK = false;
                problems.addError( doc.fileInfo.path, ...errors );
            }
        }
        return specOK;
    }

    public analyzeDocument( spec: AugmentedSpec, doc: Document, errors: SemanticException[] ): void {

        // No Test Cases -> exit
        if ( ! doc.testCases || doc.testCases.length < 1 ) {
            return;
        }

        const hasFeature = isDefined( doc.feature );
        const hasImport = isDefined( doc.imports ) && doc.imports.length > 0;

        // No Feature or Imports declared
        if ( ! hasFeature && ! hasImport ) {
            let firstTestCase = doc.testCases[ 0 ];
            const msg = 'No imports or feature declared before the test case.';
            const err = new SemanticException( msg,
                this.makeLocationWithPath( firstTestCase.location, doc.fileInfo.path ) );
            errors.push( err );
            return;
        } else if ( hasFeature ) {

            let availableFeatures: Feature[] = [ doc.feature ];
            let availableFeatureNames: string[] = [ doc.feature.name.toLowerCase() ];
            let availableFeaturePaths: string[] = doc.fileInfo ? [ doc.fileInfo.path || '' ] : [ '' ];

            for ( let testCase of doc.testCases ) {
                this.checkFeatureTags(
                    spec,
                    doc,
                    testCase,
                    availableFeatures,
                    availableFeatureNames,
                    availableFeaturePaths,
                    errors
                );
            }

        } else if ( hasImport ) {
            if ( 1 == doc.imports.length ) {
                const singleImport = doc.imports[ 0 ];
                this.processSingleImport( spec, doc, singleImport, errors );
            } else {
                this.processMultipleImports( spec, doc, errors );
            }
        }

        // @variant without @scenario, tag values, @generated
        this.checkOtherTags( doc.testCases, spec, doc, errors );

        // Update filePath if not defined
        for ( let testCase of doc.testCases ) {
            if ( ! testCase.location.filePath ) {
                testCase.location.filePath = doc.fileInfo.path;
            }
        }

        // Function to extract the test case information to compare
        const fn = ( node: TestCase ): any => {
            return '@scenario(' + ( node.declaredScenarioIndex || '0' ) + ') ' +
                '@variant(' + ( node.declaredVariantIndex || '0' ) + ') ' +
                node.name;
        };

        // Duplicated test cases
        this._checker.checkDuplicatedNamedNodes( doc.testCases, errors, 'Test Case', fn );
    }


    private processSingleImport( spec: AugmentedSpec, doc: Document, docImport: Import, errors: LocatedException[] ): boolean {

        let feature = this.featureFromImport( spec, doc, docImport, errors );
        // It must have a feature
        if ( ! feature ) {
            const msg = 'Imported document does not have a feature.';
            const err = new SemanticException( msg,
                this.makeLocationWithPath( docImport.location, doc.fileInfo.path ) );
            errors.push( err );
            return false;
        }

        return true;
    }


    private featureFromImport( spec: AugmentedSpec, doc: Document, docImport: Import, errors: LocatedException[] ): Feature {

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


    private processMultipleImports(
        spec: AugmentedSpec,
        doc: Document,
        errors: LocatedException[]
        ): boolean {

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
            this.checkFeatureTags(
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


    private checkFeatureTags(
        spec: AugmentedSpec,
        doc: Document,
        testCases: TestCase,
        availableFeatures: Feature[],
        availableFeatureNames: string[],
        availableFeaturePaths: string[],
        errors: LocatedException[]
    ): boolean {

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

        // let featureFilePath = availableFeaturePaths[ featureIndex ];

        // if ( spec.basePath ) {
        //     // Normalizes the path, according to the base path
        //     featureFilePath = path.join( spec.basePath, featureFilePath );
        // }

        return true;
    }

    private makeLocationWithPath( location: Location, path: string ): Location {
        let loc = ! location ? { } as Location : deepcopy( location ) as Location;
        loc.filePath = path;
        return loc;
    }




    checkOtherTags( testCases: TestCase[], spec: AugmentedSpec, doc: Document, errors: LocatedException[] ) {

        const msgNoFeature = 'Feature found.';
        const msgNoScenarios = 'The referenced Feature does not have Scenarios';
        const msgNoScenarioTag = 'Test Case has tag @variant but it does not have a tag @scenario. Please declare it.';
        const msgMinScenarioIndex = 'The index informed in @scenario is less than 1.';
        const msgMaxScenarioIndex = 'The index informed in @scenario is greater than the number of scenarios.';
        const msgNoScenario = 'No Scenario with the informed index.';
        const msgNoVariants = 'No Variants in the referenced Scenario.'
        const msgMinVariantIndex = 'The index informed in @variant is less than 1.';
        const msgMaxVariantIndex = 'The index informed in @variant is greater than the number of variants in the scenario.';

        for ( let tc of testCases || [] ) {

            let hasFeatureTag: boolean = false;
            let hasScenarioTag: boolean = false;
            let hasVariantTag: boolean = false;

            for ( let tag of tc.tags || [] ) {

                if ( ! hasFeatureTag && this.isFeatureTag( tag.name ) ) {
                    hasFeatureTag = true;
                    tc.declaredFeatureName = tag.content;
                }

                if ( ! hasScenarioTag && this.isScenarioTag( tag.name ) ) {
                    hasScenarioTag = true;
                    // Change the test case!
                    tc.declaredScenarioIndex = this.detectTagContentAsIndex( tag, errors ); // 1+ or null
                }

                if ( ! hasVariantTag && this.isVariantTag( tag.name ) ) {
                    hasVariantTag = true;
                    // Change the test case!
                    tc.declaredVariantIndex = this.detectTagContentAsIndex( tag, errors ); // 1+ or null
                }

                if ( this.isGeneratedTag( tag.name ) ) {
                    // Change the test case!
                    tc.generated = true;
                }
            }

            // console.log( 'doc -> ', doc.fileInfo.path );
            // console.log( 'feature -> ', tc.declaredFeatureName );
            // console.log( 'scenario -> ', tc.declaredScenarioIndex );
            // console.log( 'variant -> ', tc.declaredVariantIndex );

            let feature = doc.feature;
            if ( ! feature ) {
                let docs: Document[];

                if ( hasFeatureTag ) {
                    docs = spec.importedDocumentsOf( doc )
                        .filter( impDoc => isDefined( impDoc.feature )
                            && impDoc.feature.name.toLowerCase() == tc.declaredFeatureName.toLowerCase() );
                } else {
                    docs = spec.importedDocumentsOf( doc )
                        .filter( impDoc => isDefined( impDoc.feature ) );
                }

                // No feature
                if ( docs.length < 1 ) {
                    errors.push( new SemanticException( msgNoFeature, tc.location ) );
                    continue;
                }

                feature = docs[ 0 ].feature;
            }

            if ( hasScenarioTag ) {
                const size = ( feature.scenarios || [] ).length;
                // No scenarios
                if ( size < 1 ) {
                    errors.push( new SemanticException( msgNoScenarios, tc.location ) );
                    continue;
                }
                // Index > size
                if ( tc.declaredScenarioIndex > size ) {
                    errors.push( new SemanticException( msgMaxScenarioIndex, tc.location ) );
                    continue;
                }
                // Index < 1
                if ( tc.declaredScenarioIndex < 1 ) {
                    errors.push( new SemanticException( msgMinScenarioIndex, tc.location ) );
                    continue;
                }
            }

            if ( hasVariantTag && ! hasScenarioTag ) {
                errors.push( new SemanticException( msgNoScenarioTag, tc.location ) );
                continue;
            }

            if ( hasVariantTag ) {
                const scenario = feature.scenarios[ tc.declaredScenarioIndex - 1 ];
                if ( ! scenario ) { // should not happen since there are prior validations
                    errors.push( new SemanticException( msgNoScenario, tc.location ) );
                    continue;
                }
                const size = ( scenario.variants || [] ).length;
                // No variants
                if ( size < 1 ) {
                    errors.push( new SemanticException( msgNoVariants, tc.location ) );
                    continue;
                }
                // Index > size
                if ( tc.declaredVariantIndex > size ) {
                    errors.push( new SemanticException( msgMaxVariantIndex, tc.location ) );
                    continue;
                }
                // Index < 1
                if ( tc.declaredVariantIndex < 1 ) {
                    errors.push( new SemanticException( msgMinVariantIndex, tc.location ) );
                    continue;
                }
            }

        } // test cases

    }

    isFeatureTag( name: string ): boolean {
        return ( this._keywords.tagFeature || [ 'feature' ] ).indexOf( name.toLowerCase().trim() ) >= 0;
    }

    isScenarioTag( name: string ): boolean {
        return ( this._keywords.tagScenario || [ 'scenario' ] ).indexOf( name.toLowerCase().trim() ) >= 0;
    }

    isVariantTag( name: string ): boolean {
        return ( this._keywords.tagVariant || [ 'variant' ] ).indexOf( name.toLowerCase().trim() ) >= 0;
    }

    isGeneratedTag( name: string ): boolean {
        return ( this._keywords.tagGenerated || [ 'generated' ] ).indexOf( name.toLowerCase().trim() ) >= 0;
    }

    detectTagContentAsIndex( tag: Tag, errors: LocatedException[] ): number | null {
        let value = Array.isArray( tag.content ) ? tag.content[ 0 ] : tag.content;
        if ( ! isDefined( value ) ) {
            return value;
        }
        value = parseInt( value.trim() );
        if ( isNaN( value ) ) {
            const msg = 'This tag must have a number.';
            errors.push( new SemanticException( msg, tag.location ) );
        } else if ( value <= 0 ) {
            const msg = 'The tag content must be a number greater than zero.';
            errors.push( new SemanticException( msg, tag.location ) );
        }
        return value;
    }

}
