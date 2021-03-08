"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScenarioGenerator = void 0;
const deepcopy = require("deepcopy");
const ast_1 = require("../ast");
const RuntimeException_1 = require("../error/RuntimeException");
const nlp_1 = require("../nlp");
const DataTestCaseMix_1 = require("../testcase/DataTestCaseMix");
const TestPlanner_1 = require("../testcase/TestPlanner");
const Random_1 = require("../testdata/random/Random");
const RandomLong_1 = require("../testdata/random/RandomLong");
const TypeChecking_1 = require("../util/TypeChecking");
const StepHandler_1 = require("./StepHandler");
const TestScenario_1 = require("./TestScenario");
const VariantStateDetector_1 = require("./VariantStateDetector");
/**
 * Test Scenario Generator
 *
 * Test Scenarios are produced before Test Cases. Their generation does not depend on
 * the tag "ignore", as Test Cases do. A Test Scenario should be marked as
 * `ignoredForTestCaseGeneration` whether Variants, Scenarios or Features have the
 *  tag "ignore". Currently, however, the implementation only checks for Variants.
 *
 * TO-DO:
 *  - Check Scenarios and Features for the tag "ignore" to set `ignoredForTestCaseGeneration`.
 *  - Take Variant Backgrounds into account.
 *
 * @author Thiago Delgado Pinto
 */
class TestScenarioGenerator {
    constructor(_preTestCaseGenerator, _variantSelectionStrategy, _statePairCombinationStrategy, _variantToTestScenarioMap, _postconditionNameToVariantsMap) {
        this._preTestCaseGenerator = _preTestCaseGenerator;
        this._variantSelectionStrategy = _variantSelectionStrategy;
        this._statePairCombinationStrategy = _statePairCombinationStrategy;
        this._variantToTestScenarioMap = _variantToTestScenarioMap;
        this._postconditionNameToVariantsMap = _postconditionNameToVariantsMap;
        this._langContentLoader = this._preTestCaseGenerator.langContentLoader;
        this._defaultLanguage = this._preTestCaseGenerator.defaultLanguage;
        this._stepHandler = new StepHandler_1.StepHandler(this._langContentLoader, this._defaultLanguage);
        this.seed = this._preTestCaseGenerator.seed;
        this._randomLong = new RandomLong_1.RandomLong(new Random_1.Random(this.seed));
        // Makes a PlanMaker to create valid values for Precondition scenarios
        this._validValuePlanMaker = new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), 
        // new SingleRandomOfEachStrategy( this.seed ),
        _statePairCombinationStrategy, this.seed);
    }
    generate(ctx, variant) {
        return __awaiter(this, void 0, void 0, function* () {
            let testScenarios = [];
            // Detect Preconditions, State Calls, and Postconditions of the Variant
            // this.detectVariantStates( variant, ctx.errors ); // NOT NEEDED ANYMORE -> Done in FeatureSSA !
            // this.mapPostconditionsOf( variant );
            // console.log( 'variant', variant.name, '\n', variant.sentences.map( s => s.content ) );
            // console.log( 'pre', variant.preconditions );
            // console.log( 'post', variant.postconditions );
            const docLanguage = this._preTestCaseGenerator.docLanguage(ctx.doc);
            // Also removes Then steps with postconditions
            let baseScenario = this.makeTestScenarioFromVariant(variant, docLanguage);
            // console.log( 'baseScenario\n', baseScenario.steps.map( s => s.content ) );
            // No steps -> No test scenarios
            if (!baseScenario.steps || baseScenario.steps.length < 1) {
                return [];
            }
            let pairMap = {}; // Maps string => [ [ State, TestScenario ] ]
            const preconditions = (variant.preconditions || []).filter(st => !st.notFound);
            const stateCalls = (variant.stateCalls || []).filter(st => !st.notFound);
            let allStatesToReplace = preconditions.concat(stateCalls);
            // console.log( 'States to replace', allStatesToReplace.map( s=> s.name ) );
            if (allStatesToReplace.length > 0) { // Preconditions + State Calls
                for (let stateToReplace of allStatesToReplace) {
                    let state = deepcopy(stateToReplace);
                    if (!pairMap[state.name]) {
                        pairMap[state.name] = [];
                    }
                    else {
                        continue; // already mapped !
                    }
                    let currentMap = pairMap[state.name];
                    let producerVariants = this.variantsThatProduce(state.name);
                    // console.log( 'Producer variants:', producerVariants );
                    // No producers ? -> Error
                    if (producerVariants.length < 1) {
                        // const msg = 'The producer of the state "' + state.name + '" was not found.';
                        // const loc = variant.sentences[ state.stepIndex ].location;
                        // const err = new RuntimeException( msg, loc );
                        // ctx.errors.push( err );
                        continue;
                    }
                    // Reduce Variants
                    producerVariants = this.selectVariantsToCombine(producerVariants);
                    // console.log( 'Producer variants after reduction:', producerVariants );
                    // Make pairs State => Test Scenario to combine later
                    for (let otherVariant of producerVariants) {
                        // console.log( 'otherVariant >>', otherVariant.name, '\n', otherVariant.sentences.map( s => s.content ) );
                        let testScenario = this.selectSingleValidTestScenarioOf(otherVariant, ctx.errors); // randomly
                        // console.log( 'testScenario >>\n', testScenario.steps.map( s => s.content ) );
                        if (null === testScenario) {
                            continue; // Ignore
                        }
                        currentMap.push([state, testScenario]);
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
                let result = this._statePairCombinationStrategy.combine(pairMap);
                let testScenariosToCombineByState = result;
                if (!testScenariosToCombineByState || testScenariosToCombineByState.length < 1) {
                    testScenarios.push(baseScenario);
                }
                else {
                    // console.log( 'after combining', result );
                    for (let stateObj of testScenariosToCombineByState) {
                        let ts = baseScenario.clone();
                        // console.log( '\nNEW TS ---------------------------------\n' );
                        for (let stateInTestCase of allStatesToReplace) {
                            // console.log( "\tTS steps\n", ts.steps.map( s => s.content ) );
                            for (let stateName in stateObj) {
                                if (!stateInTestCase.nameEquals(stateName)) {
                                    continue;
                                }
                                // console.log( "\tstateName", stateName );
                                let statePair = stateObj[stateName];
                                if (!statePair) {
                                    continue;
                                }
                                // console.log( "\tstatePair\n", statePair );
                                let state = statePair[0];
                                let tsToReplaceStep = statePair[1];
                                let stepsAdded = 0;
                                // Adjust step index (precondition or state call)
                                let stepIndex = 0;
                                for (let tsStep of ts.steps) {
                                    let tsState = tsStep.nlpResult.entities.find(e => e.entity === nlp_1.Entities.STATE);
                                    if (tsState && state.nameEquals(tsState.value)) {
                                        state.stepIndex = stepIndex;
                                        break;
                                    }
                                    ++stepIndex;
                                }
                                // const variantPreconditionIndex = preconditions.indexOf( state );
                                // const isPrecondition = variantPreconditionIndex >= 0;
                                const isPrecondition = preconditions
                                    .findIndex(st => st.nameEquals(state.name)) >= 0;
                                // ---
                                // Use GenUtil to replace references and fill values of the TestScenario
                                // Clone the current TestScenario
                                let tsToUse = tsToReplaceStep.clone();
                                // Make all substitutions and generate valid values
                                let all = yield this._preTestCaseGenerator.generate(tsToReplaceStep.steps, ctx, [this._validValuePlanMaker]);
                                const preTestCase = all[0];
                                // console.log( "\nPreTestCase\n", preTestCase.steps.map( s => s.content ) );
                                // Replace TestScenario steps with the new ones
                                tsToUse.steps = preTestCase.steps;
                                // Adjust the stepAfterPreconditions
                                // tsToUse.stepAfterPreconditions = null;
                                // let oldIndex = tsToReplaceStep.steps.indexOf( tsToReplaceStep.stepAfterPreconditions );
                                // if ( oldIndex >= 0 ) {
                                // 	tsToUse.stepAfterPreconditions = tsToUse.steps[ oldIndex ];
                                // }
                                // ---
                                // console.log( 'state to replace: ', state.name, '@', state.stepIndex );
                                state.stepIndex += stepsAdded > 0 ? stepsAdded - 1 : 0;
                                stepsAdded += this.replaceStepWithTestScenario(ts, state, tsToUse, isPrecondition, docLanguage);
                                // console.log( "\nTS modified is\n", ts.steps.map( s => s.content ) );
                            }
                        }
                        testScenarios.push(ts);
                    }
                }
                // console.log( 'GENERATED', testScenarios.length, 'scenarios for states', allStatesToReplace.map( s => s.name ) );
            }
            else {
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
                testScenarios.push(baseScenario);
            }
            if (variant.postconditions && variant.postconditions.length > 0) {
                let newTestScenarios = [];
                for (let ts of testScenarios) {
                    //
                    // Let's generate valid values to the variant steps in order to reuse it later
                    // in preconditions or state calls
                    //
                    // Make all substitutions and generate valid values
                    let all = yield this._preTestCaseGenerator.generate(ts.steps, ctx, [this._validValuePlanMaker]);
                    const preTestCase = all[0];
                    // console.log( "\nVALUED PreTestCase\n", preTestCase.steps.map( s => s.content ) );
                    // Replace TestScenario steps with the new ones
                    let newTS = ts.clone();
                    newTS.steps = preTestCase.steps;
                    // newTS.stepAfterPreconditions = null;
                    // // Adjust the stepAfterPreconditions
                    // let oldIndex = ts.steps.indexOf( ts.stepAfterPreconditions );
                    // if ( oldIndex >= 0 ) {
                    //     newTS.stepAfterPreconditions = newTS.steps[ oldIndex ];
                    // }
                    newTestScenarios.push(newTS);
                }
                // Let's add to the map, to serve for other variants
                this._variantToTestScenarioMap.set(variant, newTestScenarios);
                // console.log( 'GENERATED', newTestScenarios.length, 'scenarios for reusing' );
            }
            // Add the variant to the postconditions map
            this.mapPostconditionsOf(variant);
            return testScenarios;
        });
    }
    mapPostconditionsOf(variant) {
        // Add the variant to the postconditions map
        for (let postc of variant.postconditions) {
            if (this._postconditionNameToVariantsMap.has(postc.name)) {
                let variants = this._postconditionNameToVariantsMap.get(postc.name);
                // Add only if it does not exist
                if (variants.indexOf(variant) < 0) {
                    variants.push(variant);
                }
            }
            else {
                this._postconditionNameToVariantsMap.set(postc.name, [variant]);
            }
        }
    }
    detectVariantStates(variant, errors) {
        const detector = new VariantStateDetector_1.VariantStateDetector();
        detector.update(variant);
        let removed = detector.removePreconditionsThatRefersToPostconditions(variant);
        if (removed.length > 0) {
            let wrongPreconditions = removed.map(s => s.name);
            const msg = 'These variant preconditions refers to postconditions: ' + wrongPreconditions.join(', ');
            const err = new RuntimeException_1.RuntimeException(msg, variant.location);
            errors.push(err);
        }
    }
    variantsThatProduce(stateName) {
        return this._postconditionNameToVariantsMap.get(stateName) || [];
    }
    // Reduce
    selectVariantsToCombine(variants) {
        return this._variantSelectionStrategy.select(variants);
    }
    // Any test scenario would serve, then let's select randomly
    selectSingleValidTestScenarioOf(variant, errors) {
        const testScenarios = this._variantToTestScenarioMap.get(variant);
        if (!testScenarios || testScenarios.length < 1) {
            // Generate an error
            const msg = 'Error retrieving Test Scenarios from the Variant' + variant.name;
            const err = new RuntimeException_1.RuntimeException(msg, variant.location);
            errors.push(err);
            return null;
        }
        const index = this._randomLong.between(0, testScenarios.length - 1);
        return testScenarios[index];
    }
    makeTestScenarioFromVariant(variant, docLanguage) {
        const ts = new TestScenario_1.TestScenario();
        if (!variant || !variant.sentences || variant.sentences.length < 1) {
            return ts;
        }
        // Clone the steps
        ts.steps = deepcopy(variant.sentences);
        // Remove GIVEN steps with UNDECLARED states in REVERSE ORDER
        const preconditionsToRemove = variant.preconditions
            ? variant.preconditions.filter(st => st.notFound).reverse()
            : [];
        for (const state of preconditionsToRemove) {
            const producerVariants = this.variantsThatProduce(state.name);
            // It has a producer? Nothing to do.
            if (producerVariants.length > 0) {
                continue;
            }
            // No valid step at the given index ? Ignore it.
            if (!ts.steps[state.stepIndex]) {
                continue;
            }
            ts.steps = this._stepHandler.removeStep(ts.steps, state.stepIndex, docLanguage);
        }
        // Remove THEN steps with postconditions in REVERSE ORDER
        for (const state of variant.postconditions.reverse()) {
            // No valid step at the given index ? Ignore it.
            if (!ts.steps[state.stepIndex]) {
                continue;
            }
            ts.steps = this._stepHandler.removeStep(ts.steps, state.stepIndex, docLanguage);
        }
        // Adjust stepAfterPreconditions
        // const lastPreconditionIndex = variant.preconditions.length - 1;
        // if ( lastPreconditionIndex >= 0 && lastPreconditionIndex + 1 < ts.steps.length ) {
        //     ts.stepAfterPreconditions = ts.steps[ lastPreconditionIndex + 1 ];
        // } else {
        //     ts.stepAfterPreconditions = ts.steps[ 0 ];
        // }
        // // Prepare eventual GIVEN AND steps that *do not have* States to become GIVEN steps,
        // //     and eventual WHEN AND  steps that *do not have* States to become WHEN  steps,
        // // since they will be replaced later
        // const nlpUtil = new NLPUtil();
        // const langContent = this._langContentLoader.load(
        //     isDefined( docLanguage ) ? docLanguage : this._defaultLanguage
        // );
        // const keywords: KeywordDictionary = langContent.keywords;
        // const stepAndKeyword: string = ( keywords.stepAnd || [ 'and' ] )[ 0 ];
        // const stepThenKeyword: string = ( keywords.stepThen || [ 'then' ] )[ 0 ];
        // const stepWhenKeyword: string = ( keywords.stepWhen || [ 'when' ] )[ 0 ];
        // const stepGivenKeyword: string = ( keywords.stepGiven || [ 'given' ] )[ 0 ];
        // const stepAndRegex = new RegExp( stepAndKeyword, 'i' );
        // let index = 0, priorWasGiven = false, priorWasWhen = false, priorHasState = false;
        // for ( let step of ts.steps ) {
        //     if ( step.nodeType === NodeTypes.STEP_GIVEN ) {
        //         priorWasGiven = true;
        //         priorWasWhen = false;
        //         priorHasState = nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );
        //     } else if ( step.nodeType === NodeTypes.STEP_WHEN ) {
        //         priorWasGiven = false;
        //         priorWasWhen = true;
        //         priorHasState = nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );
        //     } else if ( step.nodeType === NodeTypes.STEP_AND
        //         && priorHasState && ( priorWasGiven || priorWasWhen )
        //         && ! nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult ) ) { // current does not have state
        //         if ( priorWasGiven ) {
        //             // Change node type
        //             step.nodeType = NodeTypes.STEP_GIVEN;
        //             // Change node sentence
        //             step.content = step.content.replace( stepAndRegex, upperFirst( stepGivenKeyword ) ); // Given ...
        //         } else {
        //             // Change node type
        //             step.nodeType = NodeTypes.STEP_WHEN;
        //             // Change node sentence
        //             step.content = step.content.replace( stepAndRegex, upperFirst( stepWhenKeyword ) ); // When ...
        //         }
        //         priorHasState = false; // important
        //     }
        //     ++index;
        // }
        const langContent = this._langContentLoader.load(TypeChecking_1.isDefined(docLanguage) ? docLanguage : this._defaultLanguage);
        const keywords = langContent.keywords;
        ts.ignoreForTestCaseGeneration = this.containsIgnoreTag(variant.tags, (keywords.tagIgnore || ['ignore']));
        this._stepHandler.adjustPrefixesToReplaceStates(ts.steps, docLanguage);
        return ts;
    }
    containsIgnoreTag(tags, ignoreKeywords) {
        return ast_1.tagsWithAnyOfTheNames(tags, ignoreKeywords).length > 0;
    }
    replaceStepWithTestScenario(ts, state, tsToReplaceStep, isPrecondition, docLanguage) {
        // console.log( 'isPrecondition', isPrecondition,
        // 	'\nsteps', ts.steps, '\nto replace', tsToReplaceStep );
        // Precondition is replaced by all the steps
        // State call is replaced by all the steps but Given steps without State
        const stepsToCopy = isPrecondition
            ? tsToReplaceStep.steps
            : this._stepHandler.stepsExceptExternalOrGivenStepsWithState(tsToReplaceStep.steps, docLanguage);
        let stepsToReplace = deepcopy(stepsToCopy);
        // Set the flag "external"
        for (let step of stepsToReplace) {
            step.external = true;
        }
        // console.log( "\n\tBEFORE\n\n", ts.steps.map( s => s.content ) );
        // console.log( "\n\tSTATE INDEX", state.stepIndex, "\n\nWILL REPLACE WITH\n\n", stepsToReplace.map( s => s.content ).join( "\n" ) );
        ts.steps.splice(state.stepIndex, 1, ...stepsToReplace);
        const stepsAdded = stepsToReplace.length;
        state.stepIndex += stepsAdded;
        // console.log( "\n\tSTATE INDEX after", state.stepIndex );
        // console.log( "\n\tAFTER\n\n", ts.steps.map( s => s.content ) );
        return stepsAdded;
    }
}
exports.TestScenarioGenerator = TestScenarioGenerator;
