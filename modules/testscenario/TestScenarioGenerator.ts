import { Spec } from "../ast/Spec";
import Graph = require( 'graph.js/dist/graph.full.js' );
import { Document } from "../ast/Document";
import { Step } from "../ast/Step";
import { Feature } from "../ast/Feature";
import { Variant } from "../ast/Variant";
import { NodeTypes } from "../req/NodeTypes";
import { NLPUtil } from "../nlp/NLPResult";
import { Entities } from "../nlp/Entities";
import { RuntimeException } from "../req/RuntimeException";
import { Scenario } from "../ast/Scenario";
import { TestScenario } from "./TestScenario";
import { VariantStateDetector } from "./VariantStateDetector";
import { StateMapper } from "./StateMapper";
import { Tag, hasTagNamed } from "../ast/Tag";
import { Language } from "../ast/Language";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { State } from "../ast/VariantLike";
import { Import } from "../ast/Import";
import { LocatedException } from "../req/LocatedException";
import { TestScenarioCombinationStrategy } from "./TestScenarioCombinationStrategy";
import { TestScenarioCombinator } from "./TestScenarioCombinator";
import { isDefined } from "../util/TypeChecking";
import { VariantSelectionStrategy } from "./VariantSelectionStrategy";
import { VariantRefWithTestScenarios } from "./VariantRefWithTestScenarios";
import { StepUtil } from "./StepUtil";

/**
 * Generates test scenarios for the selected features, considering
 * preconditions, state calls, and postconditions.
 *
 * @see [test-scenarios.md](/docs/dev/test-scenarios.md)
 *
 * @author Thiago Delgado Pinto
 */
export class TestScenarioGenerator {

    constructor(
        private _langContentLoader: LanguageContentLoader,
        private _defaultLanguage: string
    ) {
    }

    generate(
        variantSelectionStrategy: VariantSelectionStrategy,
        combinationStrategy: TestScenarioCombinationStrategy,
        docGraphVertices: any,
        spec: Spec,
        errors: RuntimeException[]
    ): StateMapper {

        let stateMapper = new StateMapper();
        const extractor = new TestScenarioExtractor( stateMapper, spec, errors );
        const combinator = new TestScenarioCombinator();
        const stepUtil = new StepUtil();

        for ( let [ key, value ] of docGraphVertices ) {

            const doc = value as Document;
            if ( ! doc || ! doc.feature || ! doc.feature.scenarios ) {
                continue;
            }

            const docLangContent = this._langContentLoader.load(
                ! doc.language ? this._defaultLanguage : doc.language.value || this._defaultLanguage
            );

            for ( let scenario of doc.feature.scenarios ) {

                for ( let variant of scenario.variants || [] ) {

                    if ( ! variant.sentences || variant.sentences.length < 1 ) {
                        continue;
                    }

                    // Add a variant state info
                    let stateInfo = new VariantRefWithTestScenarios( doc, doc.feature, scenario, variant );
                    stateMapper.add( stateInfo );

                    // Create the Test Scenario with the Variant's steps

                    let testScenario = new TestScenario(
                        stateInfo,
                        [] // starts empty
                    );

                    // Add Feature's Variant Background steps
                    if ( isDefined( doc.feature.variantBackground )
                        && isDefined( doc.feature.variantBackground.sentences )
                        && doc.feature.variantBackground.sentences.length > 0
                    ) {
                        testScenario.steps.push.apply(
                            testScenario.steps,
                            doc.feature.variantBackground.sentences.slice( 0 ) // clone array
                        );
                    }

                    // Add Scenario's Variant Background steps
                    if ( isDefined( scenario.variantBackground )
                        && isDefined( scenario.variantBackground.sentences )
                        && scenario.variantBackground.sentences.length > 0
                    ) {
                        testScenario.steps.push.apply(
                            testScenario.steps,
                            scenario.variantBackground.sentences.slice( 0 ) // clone array
                        );
                    }

                    // Add Variant steps
                    testScenario.steps.push.apply(
                        testScenario.steps,
                        variant.sentences.slice( 0 ) // clone array
                    );

                    // Both Features' Variant Background, Scenarios' Variant Background, and Variants
                    // may have Given steps with Preconditions. When steps are joined, they become out
                    // of order. So, let's move them to the beginning.
                    // This CHANGE steps, to they are deep cloned then changed.
                    testScenario.steps = stepUtil.movePreconditionStepsToTheBeginning( testScenario.steps, docLangContent.keywords );

                    // Set the "ignore" flag if the Feature or the Variant has such tag
                    if ( this.hasIgnoreTag( variant.tags, doc.language )
                      || this.hasIgnoreTag( doc.feature.tags, doc.language ) ) {
                        testScenario.ignoreForTestCaseGeneration = true;
                    }

                    // Detect Preconditions, State Calls, and Postconditions of the Variant
                    this.detectVariantStates( variant, errors );

                    // Add postconditions as a system state and
                    // removes them from the test scenarios (just Then steps with state!)
                    for ( let postc of variant.postconditions ) {

                        // Removes the steps with postconditions
                        testScenario.steps.splice( postc.stepIndex, 1 );
                    }

                    // Set the first step that occur after preconditions
                    const preconditionsCount = variant.preconditions.length;
                    if ( preconditionsCount > 0 ) {
                        let lastPrecondition = variant.postconditions[ preconditionsCount - 1 ];
                        // Reference, NOT INDEX ! ;)
                        testScenario.stepAfterPreconditions = testScenario.steps[ lastPrecondition.stepIndex + 1 ];
                    } else {
                        testScenario.stepAfterPreconditions = testScenario.steps[ 0 ];
                    }

                    // The same state may occur in more than one step. States
                    // with the same name are considered equal, so a map is
                    // used to avoid mapping test scenarios more than once.

                    // Extract preconditions' related test scenarios
                    let preconditionToTestScenariosMap = extractor.extractTestScenariosFromStatesBasedOnImports(
                        doc, variant, variant.preconditions, variantSelectionStrategy );

                    // Extract state calls' related test scenarios
                    let stateCallToTestScenariosMap = extractor.extractTestScenariosFromStatesBasedOnImports(
                        doc, variant, variant.stateCalls, variantSelectionStrategy );

                    // TODO: reduce preconditions' test scenarios
                    // TODO: reduce state calls' test scenarios

                    // For each state in precondition, it should create many different test scenarios in which
                    // the corresponding step are replaced with the test scenario.??


                    // Now let's produce test scenarios from the base test scenario
                    // and its preconditions and state calls.

                    // let tsToCombine: TestScenariosToCombine[] = combinationStrategy.combine(
                    //     preconditionToTestScenariosMap,
                    //     stateCallToTestScenariosMap
                    // );

                    // let testScenarios: TestScenario[] = combinator.combine( testScenario, tsToCombine );

                    // // Add all test scenarios to the state info
                    // stateInfo.testScenarios.push.apply( stateInfo.testScenarios, testScenarios );

                } // variants
            } // scenarios
        } // documents

        return stateMapper;
    }


    detectVariantStates(
        variant: Variant,
        errors: RuntimeException[]
    ): void {

        const detector = new VariantStateDetector();
        detector.update( variant, true );

        let removed = detector.removePreconditionsThatRefersToPostconditions( variant );
        if ( removed.length > 0 ) {
            let wrongPreconditions: string[] = removed.map( s => s.name );
            const msg = 'These variant preconditions refers to postconditions: ' + wrongPreconditions.join( ', ' );
            const err = new RuntimeException( msg, variant.location );
            errors.push( err );
        }
    }


    /**
     * Returns true whether the tag "ignore" is among the given tags.
     *
     * @param tags Tags to check
     * @param docLanguage Document language
     */
    hasIgnoreTag( tags: Tag[], docLanguage: Language ): boolean {

        const langContent = this._langContentLoader.load(
            docLanguage ? docLanguage.value : this._defaultLanguage
        );

        for ( let name of langContent.keywords.tagIgnore || [ 'ignore' ] ) {
            if ( hasTagNamed( name, tags ) ) {
                return true;
            }
        }

        return false;
    }


}



class TestScenarioExtractor {

    constructor(
        public stateMapper: StateMapper,
        public spec: Spec,
        public errors: LocatedException[]
    ) {
    }

    extractTestScenariosFromStatesBasedOnImports(
        doc: Document,
        variant: Variant,
        states: State[],
        variantSelectionStrategy: VariantSelectionStrategy
    ): Map< string, TestScenario[] > {

        let map = new Map< string, TestScenario[] >();
        for ( let state of states || [] ) {

            // Already mapped ? -> ignore
            if ( map.get( state.name ) || null !== null ) {
                continue;
            }

            // Retrieve state references
            let refs = this.stateMapper.stateProducersFromImports( state.name, doc.imports, this.spec );
            if ( refs.length < 1 ) {
                const msg = 'State "' + state.name + '" is not produced by one of the Imports. Please Import the file that produces it or declare the state in a Then step.';
                const loc = variant.sentences[ state.stepIndex ].location || variant.location;
                const err = new RuntimeException( msg, loc );
                this.errors.push( err );

                map.set( state.name, [] );
                continue;
            }

            // Each state has references to many Variants
            // Let's reduce the Variants according to the given selection strategy
            let variants: Variant[]  = refs.map( ref => ref.variant );
            variants = variantSelectionStrategy.select( variants );

            let testScenarios: TestScenario[] = [];

            for ( let ref of refs ) {

                // Ignore if ref's variant is not in the selected variants
                if ( variants.indexOf( ref.variant ) < 0
                  || ! ref.testScenarios
                  || ref.testScenarios.length < 1 ) {
                    continue;
                }

                // TODO: clone scenario from the right steps if it is a state call ???

                // Add variant scenarios
                testScenarios.push.apply( testScenarios, ref.testScenarios );
            }

            map.set( state.name, testScenarios );
        }
        return map;
    }
}