import { Variant } from "../ast/Variant";
import { RuntimeException } from "../req/RuntimeException";
import { VariantStateDetector } from "./VariantStateDetector";
import { State } from "../ast/VariantLike";
import { isDefined } from "../util/TypeChecking";
import { VariantSelectionStrategy } from "./VariantSelectionStrategy";
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
import { StatePairCombinator } from "./StatePairCombinator";
import { Pair } from "ts-pair";
import * as deepcopy from 'deepcopy';

/**
 * Test Scenario generator
 *
 * > It still does not take Variant Backgrounds into account.
 *
 * @author Thiago Delgado Pinto
 */
export class TSGen {

    private readonly _randomLong: RandomLong;

    constructor(
        private _langContentLoader: LanguageContentLoader,
        private _defaultLanguage: string,
        private _variantSelectionStrategy: VariantSelectionStrategy,
        private _statePairCombinator: StatePairCombinator,
        private _variantToTestScenarioMap: Map< Variant, TestScenario[] >,
        private _postconditionNameToVariantsMap: Map< string, Variant[] >,
        seed: string
    ) {
        this._randomLong = new RandomLong( new Random( seed ) );
    }


    generate(
        docLanguage: string | undefined,
        variant: Variant,
        errors: RuntimeException[]
    ): TestScenario[] {

        let testScenarios: TestScenario[] = [];

        // Detect Preconditions, State Calls, and Postconditions of the Variant
        this.detectVariantStates( variant, errors );

        let baseScenario: TestScenario = this.makeTestScenarioFromVariant( variant, docLanguage );

        let pairMap = {}; // Maps string => Array< Pair< State, TestScenario > >

        let allStatesToReplace = variant.preconditions.concat( variant.stateCalls );

        if ( allStatesToReplace.length > 0 ) {

            for ( let state of allStatesToReplace ) {

                if ( isDefined( pairMap[ state.name ] ) ) {
                    continue;
                }

                let producerVariants = this.variantsThatProduce( state.name );
                // console.log( 'Producer variants', producerVariants );
                // No producers ? -> Error
                if ( producerVariants.length < 1 ) {
                    const msg = 'A producer of the state "' + state.name + '" was not found.';
                    const err = new RuntimeException( msg, variant.sentences[ state.stepIndex ].location );
                    errors.push( err );
                    continue;
                }

                // Reduce Variants
                producerVariants = this.selectVariantsToCombine( producerVariants );

                // Make pairs State => Test Scenario to combine later
                let pairs: Pair< State, TestScenario >[] = [];
                for ( let otherVariant of producerVariants ) {
                    let testScenario = this.selectSingleValidTestScenarioOf( otherVariant, errors );
                    if ( null === testScenario ) {
                        continue; // Ignore
                    }
                    pairs.push( new Pair( state, testScenario ) );
                }

                pairMap[ state.name ] = pairs;
            }

            //
            // Example when there are the states "foo" and "bar":
            //
            // {
            //     "foo": [ Pair( State( "foo", 1 ), TS1 ) ]
            //     "bar": [ Pair( State( "bar", 3 ), TS2 ), Pair( State( "bar", 3 ), TS3 ) ]
            // }
            //
            // All combinations will produce:
            //
            // [
            //     { "foo": Pair( State( "foo", 1 ), TS1 ), "bar": Pair( State( "bar", 3 ), TS2 ) },
            //     { "foo": Pair( State( "foo", 1 ), TS1 ), "bar": Pair( State( "bar", 3 ), TS3 ) },
            // ]
            //

            // console.log( 'pairMap', pairMap );
            // let product = cartesian( pairMap ); // TO-DO replace cartesian with strategy
            let product = this._statePairCombinator.combine( pairMap );
            // console.log( 'Product', product );
            let testScenariosToCombineByState: any[] = product;

            for ( let obj of testScenariosToCombineByState ) {
                let ts = baseScenario.clone();
                for ( let stateName in obj ) {
                    const pair = obj[ stateName ];
                    const [ state, tsToReplaceStep ] = pair.toArray();
                    const isPrecondition = variant.preconditions.indexOf( state ) >= 0;
                    this.replaceStepWithTestScenario( ts, state.stepIndex, tsToReplaceStep, isPrecondition );
                }
                testScenarios.push( ts );
            }

        } else {
            testScenarios.push( baseScenario );
        }

        // Let's add to the map, to serve for other variants
        this._variantToTestScenarioMap.set( variant, testScenarios );

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

        // Remove postconditions from steps
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
                    nextStep.content = nextStep.content.replace( stepAndRegex, this.upperFirst( stepThenKeyword ) ); // Then ...
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

        // Prepare eventual GIVEN AND steps that are *not* Preconditions to become GIVEN steps,
        // since they will be replaced later
        const nlpUtil = new NLPUtil();
        const stepGivenKeyword: string = ( keywords.stepGiven || [ 'given' ] )[ 0 ];
        for ( let index = 0; index < sentencesCount; ++index ) {
            let step = ts.steps[ index ];
            if ( ts.stepAfterPreconditions === step ) {
                break;
            }
            let nextStep = index + 1 < sentencesCount ? ts.steps[ index + 1 ] : null;
            if ( null === nextStep ) {
                break;
            }
            if ( nextStep.nodeType === NodeTypes.STEP_AND
                && ! nlpUtil.hasEntityNamed( Entities.STATE, nextStep.nlpResult ) ) {
                // Change node type
                nextStep.nodeType = NodeTypes.STEP_GIVEN;
                // Change node sentence
                nextStep.content = nextStep.content.replace( stepAndRegex, this.upperFirst( stepGivenKeyword ) ); // Given ...
            }
        }


        ts.ignoreForTestCaseGeneration = this.containsIgnoreTag( variant.tags, ( keywords.tagIgnore || [ 'ignore' ] ) );

        return ts;
    }


    containsIgnoreTag( tags: Tag[], ignoreKeywords: string[] ): boolean {
        return tagsWithAnyOfTheNames( tags, ignoreKeywords ).length > 0;
    }


    replaceStepWithTestScenario(
        ts: TestScenario,
        stepIndex: number,
        tsToReplaceStep: TestScenario,
        isPrecondition: boolean
    ) {
        const stepsToReplace: Step[] = isPrecondition ? tsToReplaceStep.steps : tsToReplaceStep.stepsWithoutPreconditions();
        ts.steps.splice( stepIndex, 1, ... stepsToReplace );
    }

    upperFirst( text: string ): string {
        if ( !! text[ 0 ] ) {
            return text[ 0 ].toUpperCase() + text.substr( 1 );
        }
        return text;
    }

}


/**
 * Test Scenario
 *
 * @author Thiago Delgado Pinto
 */
export class TestScenario {

    /**
     * When the respective Feature or Variant has a tag `ignore`,
     * the Test Scenario must be ignored for Test Case generation.
     **/
    ignoreForTestCaseGeneration: boolean = false;

    /**
     * Step after state preconditions. Precondition steps must be
     * the first ones in a Variant. So this makes a reference to
     * the step after all preconditions, in order to allow ignoring
     * them, which is needed for State Calls.
     */
    stepAfterPreconditions: Step = null;


    steps: Step[] = [];


    clone(): TestScenario {
        let ts = new TestScenario();
        ts.steps = this.steps.slice( 0 );
        ts.ignoreForTestCaseGeneration = this.ignoreForTestCaseGeneration;
        ts.stepAfterPreconditions = this.stepAfterPreconditions;
        return ts;
    }

    stepsWithoutPreconditions(): Step[] {
        if ( null === this.stepAfterPreconditions ) {
            return this.steps;
        }
        let subset: Step[] = [];
        let canAdd: boolean = false;
        for ( let step of this.steps ) {
            if ( ! canAdd && step === this.stepAfterPreconditions ) {
                canAdd = true;
            }
            if ( canAdd ) {
                subset.push( step );
            }
        }
        return subset;
    }

}