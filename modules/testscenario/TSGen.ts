import { TestScenario } from "./TestScenario";
import { Variant } from "../ast/Variant";
import { RuntimeException } from "../req/RuntimeException";
import { VariantStateDetector } from "./VariantStateDetector";
import { State } from "../ast/VariantLike";
import { isDefined } from "../util/TypeChecking";
import { VariantSelectionStrategy } from "../selection/VariantSelectionStrategy";
import { RandomLong } from "../testdata/random/RandomLong";
import { Random } from "../testdata/random/Random";
import { Step } from "../ast/Step";
import { TagUtil } from "../util/TagUtil";
import { Tag, tagsWithAnyOfTheNames } from "../ast/Tag";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { NodeTypes } from "../req/NodeTypes";
import { LanguageContent } from "../dict/LanguageContent";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { NLPUtil } from "../nlp/NLPResult";
import { Entities } from "../nlp/Entities";
import { CombinationStrategy, SingleRandomOfEachStrategy } from "../selection/CombinationStrategy";
import * as deepcopy from 'deepcopy';
import { upperFirst } from "../util/CaseConversor";
import { PreTestCaseGenerator, GenContext } from "./PreTestCaseGenerator";
import { TestPlanMaker } from "../testcase/TestPlanMaker";
import { OnlyValidMix } from "../testcase/DataTestCaseMix";
import { Location } from '../ast/Location';

/**
 * Test Scenario generator
 *
 * > It still does not take Variant Backgrounds into account.
 *
 * @author Thiago Delgado Pinto
 */
export class TSGen {

    private readonly _randomLong: RandomLong;
    private readonly _langContentLoader: LanguageContentLoader;
    private readonly _defaultLanguage: string;
    public readonly seed: string;

    private readonly _validValuePlanMaker: TestPlanMaker;

    constructor(
        private _preTestCaseGenerator: PreTestCaseGenerator,
        private _variantSelectionStrategy: VariantSelectionStrategy,
        private _statePairCombinationStrategy: CombinationStrategy,
        private _variantToTestScenarioMap: Map< Variant, TestScenario[] >,
        private _postconditionNameToVariantsMap: Map< string, Variant[] >
    ) {
        this._langContentLoader = this._preTestCaseGenerator.langContentLoader;
        this._defaultLanguage = this._preTestCaseGenerator.defaultLanguage;
        this.seed = this._preTestCaseGenerator.seed;
        this._randomLong = new RandomLong( new Random( this.seed ) );

        // Makes a PlanMaker to create valid values for Precondition scenarios
        this._validValuePlanMaker = new TestPlanMaker(
            new OnlyValidMix(),
            // new SingleRandomOfEachStrategy( this.seed ),
            _statePairCombinationStrategy,
            this.seed
        );
    }


    async generate(
        ctx: GenContext,
        variant: Variant
    ): Promise< TestScenario[] > {

        let testScenarios: TestScenario[] = [];

        // Detect Preconditions, State Calls, and Postconditions of the Variant
        this.detectVariantStates( variant, ctx.errors );

        // console.log( 'variant', variant.name, '\n', variant.sentences.map( s => s.content ) );
        // console.log( 'pre', variant.preconditions );
        // console.log( 'post', variant.postconditions );

        const docLanguage = this._preTestCaseGenerator.docLanguage( ctx.doc );

        // Also removes Then steps with postconditions
        let baseScenario: TestScenario = this.makeTestScenarioFromVariant( variant, docLanguage );
        // console.log( 'baseScenario\n', baseScenario.steps.map( s => s.content ) );

        // No steps -> No test scenarios
        if ( ! baseScenario.steps || baseScenario.steps.length < 1 ) {
            return [];
        }

        let pairMap = {}; // Maps string => [ [ State, TestScenario ] ]

        let allStatesToReplace = variant.preconditions.concat( variant.stateCalls );
        // console.log( 'States to replace', allStatesToReplace.map( s=> s.name ) );

        if ( allStatesToReplace.length > 0 ) { // Preconditions + State Calls

            for ( let stateToReplace of allStatesToReplace ) {

                let state = deepcopy( stateToReplace );

                // Already mapped?
                if ( isDefined( pairMap[ state.name ] ) ) {
                    continue;
                }
                if ( ! pairMap[ state.name ] ) {
                    pairMap[ state.name ] = [];
                }
                let currentMap = pairMap[ state.name ];

                let producerVariants = this.variantsThatProduce( state.name );
                // console.log( 'Producer variants', producerVariants );

                // No producers ? -> Error
                if ( producerVariants.length < 1 ) {
                    const msg = 'A producer of the state "' + state.name + '" was not found.';
                    const loc = variant.sentences[ state.stepIndex ].location;
                    const err = new RuntimeException( msg, loc );
                    ctx.errors.push( err );
                    continue;
                }

                // Reduce Variants
                producerVariants = this.selectVariantsToCombine( producerVariants );

                // Make pairs State => Test Scenario to combine later
                for ( let otherVariant of producerVariants ) {
                    // console.log( 'otherVariant >>', otherVariant.name, '\n', otherVariant.sentences.map( s => s.content ) );
                    let testScenario = this.selectSingleValidTestScenarioOf( otherVariant, ctx.errors ); // randomly
                    // console.log( 'testScenario >>\n', testScenario.steps.map( s => s.content ) );
                    if ( null === testScenario ) {
                        continue; // Ignore
                    }
                    currentMap.push( [ state, testScenario ] );
                }
            }

            // console.log( 'pairMap', pairMap );

            //
            // Example when there are the states "foo" and "bar":
            //
            // {
            //     "foo": [ [ State( "foo", 1 ), TS1 ] ]
            //     "bar": [ [ State( "bar", 3 ), TS2 ], [ State( "bar", 3 ), TS3 ] ]
            // }
            //
            // All combinations will produce:
            //
            // [
            //     { "foo": [ State( "foo", 1 ), TS1 ], "bar": [ State( "bar", 3 ), TS2 ] },
            //     { "foo": [ State( "foo", 1 ), TS1 ], "bar": [ State( "bar", 3 ), TS3 ] },
            // ]
            //

            // console.log( 'pairMap', JSON.stringify( pairMap ) );

            // let product = cartesian( pairMap ); // TO-DO replace cartesian with strategy
            let result = this._statePairCombinationStrategy.combine( pairMap );

            let testScenariosToCombineByState: any[] = result;

            // console.log( 'after combining', result );

            for ( let stateObj of testScenariosToCombineByState ) {

                let ts = baseScenario.clone();

                // console.log( '\nNEW TS ---------------------------------\n' );

                for ( let stateInTestCase of allStatesToReplace ) {

                    // console.log( "\tTS steps\n", ts.steps.map( s => s.content ) );

                    for ( let stateName in stateObj ) {

                        if ( ! stateInTestCase.nameEquals( stateName ) ) {
                            continue;
                        }

                        // console.log( "\tstateName", stateName );

                        let statePair = stateObj[ stateName ];

                        // console.log( "\tstatePair\n", statePair );

                        let state = statePair[ 0 ];
                        let tsToReplaceStep = statePair[ 1 ];
                        let stepsAdded = 0;

                        // Adjust step index (precondition or state call)
                        let stepIndex: number = 0;
                        for ( let tsStep of ts.steps ) {
                            let tsState = tsStep.nlpResult.entities.find( e => e.entity === Entities.STATE );
                            if ( tsState && state.nameEquals( tsState.value ) ) {
                                state.stepIndex = stepIndex;
                                break;
                            }
                            ++stepIndex;
                        }

                        const variantPreconditionIndex = variant.preconditions.indexOf( state );
                        const isPrecondition = variantPreconditionIndex >= 0;

                        // ---
                        // Use GenUtil to replace references and fill values of the TestScenario

                        // Clone the current TestScenario
                        let tsToUse: TestScenario = tsToReplaceStep.clone();

                        // Make all substitutions and generate valid values
                        let all = await this._preTestCaseGenerator.generate(
                            tsToReplaceStep.steps,
                            ctx,
                            [ this._validValuePlanMaker ]
                        );

                        const preTestCase = all[ 0 ];

                        // console.log( "\nPreTestCase\n", preTestCase.steps.map( s => s.content ) );

                        // Replace TestScenario steps with the new ones
                        tsToUse.steps = preTestCase.steps;

                        // Adjust the stepAfterPreconditions
                        tsToUse.stepAfterPreconditions = null;
                        let oldIndex = tsToReplaceStep.steps.indexOf( tsToReplaceStep.stepAfterPreconditions );
                        if ( oldIndex >= 0 ) {
                            tsToUse.stepAfterPreconditions = tsToUse.steps[ oldIndex ];
                        }
                        // ---

                        // console.log( 'state to replace: ', state.name, '@', state.stepIndex );
                        state.stepIndex += stepsAdded > 0 ? stepsAdded - 1 : 0;
                        stepsAdded += this.replaceStepWithTestScenario( ts, state, tsToUse, isPrecondition );
                        // console.log( "\nTS modified is\n", ts.steps.map( s => s.content ) );
                    }

                }
                testScenarios.push( ts );
            }

            // console.log( 'GENERATED', testScenarios.length, 'scenarios for states', allStatesToReplace.map( s => s.name ) );

        } else {

            // console.log( 'steps', baseScenario.steps.map( s => s.content ) );

            // // Make all substitutions and generate valid values
            // let all = await this._preTestCaseGenerator.generate(
            //     baseScenario.steps,
            //     ctx,
            //     [ this._validValuePlanMaker ]
            // );

            // let oldIndex = baseScenario.steps.indexOf( baseScenario.stepAfterPreconditions );
            // baseScenario.steps = all[ 0 ].steps;
            // if ( oldIndex >= 0 ) {
            //     baseScenario.stepAfterPreconditions = baseScenario.steps[ oldIndex ];
            // }

            testScenarios.push( baseScenario );
        }

        if ( isDefined( variant.postconditions ) && variant.postconditions.length > 0 ) {

            let newTestScenarios: TestScenario[] = [];
            for ( let ts of testScenarios ) {

                //
                // Let's generate valid values to the variant steps in order to reuse it later
                // in preconditions or state calls
                //

                // Make all substitutions and generate valid values
                let all = await this._preTestCaseGenerator.generate(
                    ts.steps,
                    ctx,
                    [ this._validValuePlanMaker ]
                );

                const preTestCase = all[ 0 ];

                // console.log( "\nVALUED PreTestCase\n", preTestCase.steps.map( s => s.content ) );

                // Replace TestScenario steps with the new ones
                let newTS = ts.clone();
                newTS.steps = preTestCase.steps;
                newTS.stepAfterPreconditions = null;

                // Adjust the stepAfterPreconditions
                let oldIndex = ts.steps.indexOf( ts.stepAfterPreconditions );
                if ( oldIndex >= 0 ) {
                    newTS.stepAfterPreconditions = newTS.steps[ oldIndex ];
                }

                newTestScenarios.push( newTS );
            }

            // Let's add to the map, to serve for other variants
            this._variantToTestScenarioMap.set( variant, newTestScenarios );

            // console.log( 'GENERATED', newTestScenarios.length, 'scenarios for reusing' );
        }

        // Add the variant to the postconditions map
        for ( let postc of variant.postconditions ) {
            if ( this._postconditionNameToVariantsMap.has( postc.name ) ) {
                let variants = this._postconditionNameToVariantsMap.get( postc.name );
                // Add only if it does not exist
                if ( variants.indexOf( variant ) < 0 ) {
                    variants.push( variant );
                }
            } else {
                this._postconditionNameToVariantsMap.set( postc.name, [ variant ] );
            }
        }

        return testScenarios;
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


    variantsThatProduce( stateName: string ): Variant[] {
        return this._postconditionNameToVariantsMap.get( stateName ) ||  [];
    }


    // Reduce
    selectVariantsToCombine( variants: Variant[] ): Variant[] {
        return this._variantSelectionStrategy.select( variants );
    }

    // Any test scenario would serve, then let's select randomly
    selectSingleValidTestScenarioOf( variant: Variant, errors: RuntimeException[] ): TestScenario | null {

        const testScenarios: TestScenario[] = this._variantToTestScenarioMap.get( variant );

        if ( ! testScenarios || testScenarios.length < 1 ) {
            // Generate an error
            const msg = 'Error retrieving Test Scenarios from the Variant' + variant.name;
            const err = new RuntimeException( msg, variant.location );
            errors.push( err );

            return null;
        }

        const index = this._randomLong.between( 0, testScenarios.length - 1 );
        return testScenarios[ index ];
    }

    makeTestScenarioFromVariant( variant: Variant, docLanguage: string | undefined ): TestScenario {
        let ts = new TestScenario();

        let sentencesCount = variant.sentences.length;
        if ( sentencesCount < 1 ) {
            return ts;
        }

        const langContent = this._langContentLoader.load(
            isDefined( docLanguage ) ? docLanguage : this._defaultLanguage
        );
        const keywords: KeywordDictionary = langContent.keywords;

        // Steps
        ts.steps = deepcopy( variant.sentences ) as Step[]; // variant.sentences.slice( 0 ); // make another array with the same items

        // Remove Then steps with postconditions
        const stepAndKeyword: string = ( keywords.stepAnd || [ 'and' ] )[ 0 ];
        const stepThenKeyword: string = ( keywords.stepThen || [ 'then' ] )[ 0 ];
        const stepAndRegex = new RegExp( stepAndKeyword, 'i' );

        for ( let postc of variant.postconditions ) {

            // Make the next step to become a THEN instead of an AND, if needed
            if ( postc.stepIndex + 1 < sentencesCount ) {
                let nextStep = ts.steps[ postc.stepIndex + 1 ];
                if ( nextStep.nodeType === NodeTypes.STEP_AND ) {
                    // Change the node type
                    nextStep.nodeType = NodeTypes.STEP_THEN;
                    // Change the sentence content!
                    nextStep.content = nextStep.content.replace( stepAndRegex, upperFirst( stepThenKeyword ) ); // Then ...
                }
            }

            ts.steps.splice( postc.stepIndex, 1 );
        }

        sentencesCount = ts.steps.length;

        // Step after Precondition
        const lastPreconditionIndex = variant.preconditions.length - 1;
        if ( lastPreconditionIndex >= 0 && lastPreconditionIndex + 1 < sentencesCount ) {
            ts.stepAfterPreconditions = ts.steps[ lastPreconditionIndex + 1 ];
        } else {
            ts.stepAfterPreconditions = ts.steps[ 0 ];
        }

        // Prepare eventual GIVEN AND steps that *do not have* States to become GIVEN steps,
        //     and eventual WHEN AND  steps that *do not have* States to become WHEN  steps,
        // since they will be replaced later
        const nlpUtil = new NLPUtil();
        const stepWhenKeyword: string = ( keywords.stepWhen || [ 'when' ] )[ 0 ];
        const stepGivenKeyword: string = ( keywords.stepGiven || [ 'given' ] )[ 0 ];
        let index = 0, priorWasGiven = false, priorWasWhen = false, priorHasState = false;
        for ( let step of ts.steps ) {

            if ( step.nodeType === NodeTypes.STEP_GIVEN ) {
                priorWasGiven = true;
                priorWasWhen = false;
                priorHasState = nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );

            } else if ( step.nodeType === NodeTypes.STEP_WHEN ) {
                priorWasGiven = false;
                priorWasWhen = true;
                priorHasState = nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );

            } else if ( step.nodeType === NodeTypes.STEP_AND
                && priorHasState && ( priorWasGiven || priorWasWhen )
                && ! nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult ) ) { // current does not have state

                if ( priorWasGiven ) {
                    // Change node type
                    step.nodeType = NodeTypes.STEP_GIVEN;
                    // Change node sentence
                    step.content = step.content.replace( stepAndRegex, upperFirst( stepGivenKeyword ) ); // Given ...
                } else {
                    // Change node type
                    step.nodeType = NodeTypes.STEP_WHEN;
                    // Change node sentence
                    step.content = step.content.replace( stepAndRegex, upperFirst( stepWhenKeyword ) ); // When ...
                }

                priorHasState = false; // important
            }

            ++index;
        }


        ts.ignoreForTestCaseGeneration = this.containsIgnoreTag( variant.tags, ( keywords.tagIgnore || [ 'ignore' ] ) );

        return ts;
    }


    containsIgnoreTag( tags: Tag[], ignoreKeywords: string[] ): boolean {
        return tagsWithAnyOfTheNames( tags, ignoreKeywords ).length > 0;
    }


    replaceStepWithTestScenario(
        ts: TestScenario,
        state: State,
        tsToReplaceStep: TestScenario,
        isPrecondition: boolean
    ) {
        let stepsToReplace: Step[] = deepcopy(
            isPrecondition ? tsToReplaceStep.steps : tsToReplaceStep.stepsWithoutPreconditions()
        );

        // Set the flag "external"
        for ( let step of stepsToReplace ) {
            step.external = true;
        }

        // console.log( "\n\tBEFORE\n\n", ts.steps.map( s => s.content ) );
        // console.log( "\n\tSTATE INDEX", state.stepIndex, "\n\nWILL REPLACE WITH\n\n", stepsToReplace.map( s => s.content ).join( "\n" ) );

        ts.steps.splice( state.stepIndex, 1, ... stepsToReplace );
        const stepsAdded = stepsToReplace.length;
        state.stepIndex += stepsAdded;

        // console.log( "\n\tSTATE INDEX after", state.stepIndex );
        // console.log( "\n\tAFTER\n\n", ts.steps.map( s => s.content ) );

        return stepsAdded;
    }

}