"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestScenario_1 = require("./TestScenario");
const RuntimeException_1 = require("../req/RuntimeException");
const VariantStateDetector_1 = require("./VariantStateDetector");
const TypeChecking_1 = require("../util/TypeChecking");
const RandomLong_1 = require("../testdata/random/RandomLong");
const Random_1 = require("../testdata/random/Random");
const Tag_1 = require("../ast/Tag");
const NodeTypes_1 = require("../req/NodeTypes");
const NLPResult_1 = require("../nlp/NLPResult");
const Entities_1 = require("../nlp/Entities");
const CombinationStrategy_1 = require("../selection/CombinationStrategy");
const ts_pair_1 = require("ts-pair");
const deepcopy = require("deepcopy");
const CaseConversor_1 = require("../util/CaseConversor");
const TestPlanMaker_1 = require("../testcase/TestPlanMaker");
const DataTestCaseMix_1 = require("../testcase/DataTestCaseMix");
/**
 * Test Scenario generator
 *
 * > It still does not take Variant Backgrounds into account.
 *
 * @author Thiago Delgado Pinto
 */
class TSGen {
    constructor(_preTestCaseGenerator, _variantSelectionStrategy, _statePairCombinationStrategy, _variantToTestScenarioMap, _postconditionNameToVariantsMap) {
        this._preTestCaseGenerator = _preTestCaseGenerator;
        this._variantSelectionStrategy = _variantSelectionStrategy;
        this._statePairCombinationStrategy = _statePairCombinationStrategy;
        this._variantToTestScenarioMap = _variantToTestScenarioMap;
        this._postconditionNameToVariantsMap = _postconditionNameToVariantsMap;
        this._langContentLoader = this._preTestCaseGenerator.langContentLoader;
        this._defaultLanguage = this._preTestCaseGenerator.defaultLanguage;
        this.seed = this._preTestCaseGenerator.seed;
        this._randomLong = new RandomLong_1.RandomLong(new Random_1.Random(this.seed));
        // Makes a PlanMaker to create valid values for Precondition scenarios
        this._validValuePlanMaker = new TestPlanMaker_1.TestPlanMaker(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.SingleRandomOfEachStrategy(this.seed), this.seed);
    }
    generate(ctx, variant) {
        return __awaiter(this, void 0, void 0, function* () {
            let testScenarios = [];
            // Detect Preconditions, State Calls, and Postconditions of the Variant
            this.detectVariantStates(variant, ctx.errors);
            // console.log( 'pre', variant.preconditions );
            // console.log( 'post', variant.postconditions );
            const docLanguage = this._preTestCaseGenerator.docLanguage(ctx.doc);
            // Also removes Then steps with postconditions
            let baseScenario = this.makeTestScenarioFromVariant(variant, docLanguage);
            // console.log( '>>>', baseScenario.steps.map( s => s.content ) );
            // No steps -> No test scenarios
            if (!baseScenario.steps || baseScenario.steps.length < 1) {
                return [];
            }
            let pairMap = {}; // Maps string => Array< Pair< State, TestScenario > >
            let allStatesToReplace = variant.preconditions.concat(variant.stateCalls);
            // console.log( 'States to replace', allStatesToReplace.map( s=> s.name ) );
            if (allStatesToReplace.length > 0) {
                for (let state of allStatesToReplace) {
                    if (TypeChecking_1.isDefined(pairMap[state.name])) {
                        continue;
                    }
                    let producerVariants = this.variantsThatProduce(state.name);
                    // console.log( 'Producer variants', producerVariants );
                    // No producers ? -> Error
                    if (producerVariants.length < 1) {
                        const msg = 'A producer of the state "' + state.name + '" was not found.';
                        const loc = variant.sentences[state.stepIndex].location;
                        const err = new RuntimeException_1.RuntimeException(msg, loc);
                        ctx.errors.push(err);
                        continue;
                    }
                    // Reduce Variants
                    producerVariants = this.selectVariantsToCombine(producerVariants);
                    // Make pairs State => Test Scenario to combine later
                    let pairs = [];
                    for (let otherVariant of producerVariants) {
                        let testScenario = this.selectSingleValidTestScenarioOf(otherVariant, ctx.errors); // randomly
                        if (null === testScenario) {
                            continue; // Ignore
                        }
                        pairs.push(new ts_pair_1.Pair(state, testScenario));
                    }
                    pairMap[state.name] = pairs;
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
                let result = this._statePairCombinationStrategy.combine(pairMap);
                // console.log( 'Product', product );
                let testScenariosToCombineByState = result;
                for (let obj of testScenariosToCombineByState) {
                    let ts = baseScenario.clone();
                    // console.log( "\nTS is\n", ts.steps.map( s => s.content ) );
                    for (let stateName in obj) {
                        const pair = obj[stateName];
                        let [state, tsToReplaceStep] = pair.toArray();
                        const isPrecondition = variant.preconditions.indexOf(state) >= 0;
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
                        tsToUse.stepAfterPreconditions = null;
                        // Adjust the stepAfterPreconditions
                        let oldIndex = tsToReplaceStep.steps.indexOf(tsToReplaceStep.stepAfterPreconditions);
                        if (oldIndex >= 0) {
                            tsToUse.stepAfterPreconditions = tsToUse.steps[oldIndex];
                        }
                        // ---
                        this.replaceStepWithTestScenario(ts, state.stepIndex, tsToUse, isPrecondition);
                    }
                    // console.log( "\nTS modified is\n", ts.steps.map( s => s.content ) );
                    testScenarios.push(ts);
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
            if (TypeChecking_1.isDefined(variant.postconditions) && variant.postconditions.length > 0) {
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
                    newTS.stepAfterPreconditions = null;
                    // Adjust the stepAfterPreconditions
                    let oldIndex = ts.steps.indexOf(ts.stepAfterPreconditions);
                    if (oldIndex >= 0) {
                        newTS.stepAfterPreconditions = newTS.steps[oldIndex];
                    }
                    newTestScenarios.push(newTS);
                }
                // Let's add to the map, to serve for other variants
                this._variantToTestScenarioMap.set(variant, newTestScenarios);
                // console.log( 'GENERATED', newTestScenarios.length, 'scenarios for reusing' );
            }
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
            return testScenarios;
        });
    }
    detectVariantStates(variant, errors) {
        const detector = new VariantStateDetector_1.VariantStateDetector();
        detector.update(variant, true);
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
        let ts = new TestScenario_1.TestScenario();
        let sentencesCount = variant.sentences.length;
        if (sentencesCount < 1) {
            return ts;
        }
        const langContent = this._langContentLoader.load(TypeChecking_1.isDefined(docLanguage) ? docLanguage : this._defaultLanguage);
        const keywords = langContent.keywords;
        // Steps
        ts.steps = deepcopy(variant.sentences); // variant.sentences.slice( 0 ); // make another array with the same items
        // Remove Then steps with postconditions
        const stepAndKeyword = (keywords.stepAnd || ['and'])[0];
        const stepThenKeyword = (keywords.stepThen || ['then'])[0];
        const stepAndRegex = new RegExp(stepAndKeyword, 'i');
        for (let postc of variant.postconditions) {
            // Make the next step to become a THEN instead of an AND, if needed
            if (postc.stepIndex + 1 < sentencesCount) {
                let nextStep = ts.steps[postc.stepIndex + 1];
                if (nextStep.nodeType === NodeTypes_1.NodeTypes.STEP_AND) {
                    // Change the node type
                    nextStep.nodeType = NodeTypes_1.NodeTypes.STEP_THEN;
                    // Change the sentence content!
                    nextStep.content = nextStep.content.replace(stepAndRegex, CaseConversor_1.upperFirst(stepThenKeyword)); // Then ...
                }
            }
            ts.steps.splice(postc.stepIndex, 1);
        }
        sentencesCount = ts.steps.length;
        // Step after Precondition
        const lastPreconditionIndex = variant.preconditions.length - 1;
        if (lastPreconditionIndex >= 0 && lastPreconditionIndex + 1 < sentencesCount) {
            ts.stepAfterPreconditions = ts.steps[lastPreconditionIndex + 1];
        }
        else {
            ts.stepAfterPreconditions = ts.steps[0];
        }
        // Prepare eventual GIVEN AND steps that *do not have* States to become GIVEN steps,
        //     and eventual WHEN AND  steps that *do not have* States to become WHEN  steps,
        // since they will be replaced later
        const nlpUtil = new NLPResult_1.NLPUtil();
        const stepWhenKeyword = (keywords.stepWhen || ['when'])[0];
        const stepGivenKeyword = (keywords.stepGiven || ['given'])[0];
        let index = 0, priorWasGiven = false, priorWasWhen = false, priorHasState = false;
        for (let step of ts.steps) {
            if (step.nodeType === NodeTypes_1.NodeTypes.STEP_GIVEN) {
                priorWasGiven = true;
                priorWasWhen = false;
                priorHasState = nlpUtil.hasEntityNamed(Entities_1.Entities.STATE, step.nlpResult);
            }
            else if (step.nodeType === NodeTypes_1.NodeTypes.STEP_WHEN) {
                priorWasGiven = false;
                priorWasWhen = true;
                priorHasState = nlpUtil.hasEntityNamed(Entities_1.Entities.STATE, step.nlpResult);
            }
            else if (step.nodeType === NodeTypes_1.NodeTypes.STEP_AND
                && priorHasState && (priorWasGiven || priorWasWhen)
                && !nlpUtil.hasEntityNamed(Entities_1.Entities.STATE, step.nlpResult)) {
                if (priorWasGiven) {
                    // Change node type
                    step.nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
                    // Change node sentence
                    step.content = step.content.replace(stepAndRegex, CaseConversor_1.upperFirst(stepGivenKeyword)); // Given ...
                }
                else {
                    // Change node type
                    step.nodeType = NodeTypes_1.NodeTypes.STEP_WHEN;
                    // Change node sentence
                    step.content = step.content.replace(stepAndRegex, CaseConversor_1.upperFirst(stepWhenKeyword)); // When ...
                }
                priorHasState = false; // important
            }
            ++index;
        }
        ts.ignoreForTestCaseGeneration = this.containsIgnoreTag(variant.tags, (keywords.tagIgnore || ['ignore']));
        return ts;
    }
    containsIgnoreTag(tags, ignoreKeywords) {
        return Tag_1.tagsWithAnyOfTheNames(tags, ignoreKeywords).length > 0;
    }
    replaceStepWithTestScenario(ts, stepIndex, tsToReplaceStep, isPrecondition) {
        let stepsToReplace = deepcopy(isPrecondition ? tsToReplaceStep.steps : tsToReplaceStep.stepsWithoutPreconditions());
        // Set the flag "external"
        for (let step of stepsToReplace) {
            step.external = true;
        }
        // console.log( "\nBEFORE\n\n", ts.steps.map( s => s.content ).join( "\n" ) );
        // console.log( "\nSTEPS to replace index", stepIndex, "\n\n", stepsToReplace.map( s => s.content ).join( "\n" ) );
        ts.steps.splice(stepIndex, 1, ...stepsToReplace);
        // console.log( "\nAFTER\n\n", ts.steps.map( s => s.content ).join( "\n" ) );
    }
}
exports.TSGen = TSGen;
//# sourceMappingURL=TSGen.js.map