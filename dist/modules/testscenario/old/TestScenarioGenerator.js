"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RuntimeException_1 = require("../../req/RuntimeException");
const TestScenario_1 = require("./TestScenario");
const VariantStateDetector_1 = require("../VariantStateDetector");
const StateMapper_1 = require("./StateMapper");
const Tag_1 = require("../../ast/Tag");
const TestScenarioCombinator_1 = require("./TestScenarioCombinator");
const TypeChecking_1 = require("../../util/TypeChecking");
const VariantRefWithTestScenarios_1 = require("./VariantRefWithTestScenarios");
const StepUtil_1 = require("../StepUtil");
/**
 * Generates test scenarios for the selected features, considering
 * preconditions, state calls, and postconditions.
 *
 * @see [test-scenarios.md](/docs/dev/test-scenarios.md)
 *
 * @author Thiago Delgado Pinto
 */
class TestScenarioGenerator {
    constructor(_langContentLoader, _defaultLanguage) {
        this._langContentLoader = _langContentLoader;
        this._defaultLanguage = _defaultLanguage;
    }
    generate(variantSelectionStrategy, combinationStrategy, docGraphVertices, spec, errors) {
        let stateMapper = new StateMapper_1.StateMapper();
        const extractor = new TestScenarioExtractor(stateMapper, spec, errors);
        const combinator = new TestScenarioCombinator_1.TestScenarioCombinator();
        const stepUtil = new StepUtil_1.StepUtil();
        for (let [key, value] of docGraphVertices) {
            const doc = value;
            if (!doc || !doc.feature || !doc.feature.scenarios) {
                continue;
            }
            const docLangContent = this._langContentLoader.load(!doc.language ? this._defaultLanguage : doc.language.value || this._defaultLanguage);
            for (let scenario of doc.feature.scenarios) {
                for (let variant of scenario.variants || []) {
                    if (!variant.sentences || variant.sentences.length < 1) {
                        continue;
                    }
                    // Add a variant state info
                    let stateInfo = new VariantRefWithTestScenarios_1.VariantRefWithTestScenarios(doc, doc.feature, scenario, variant);
                    stateMapper.add(stateInfo);
                    // Create the Test Scenario with the Variant's steps
                    let testScenario = new TestScenario_1.TestScenario(stateInfo, [] // starts empty
                    );
                    // Add Feature's Variant Background steps
                    if (TypeChecking_1.isDefined(doc.feature.variantBackground)
                        && TypeChecking_1.isDefined(doc.feature.variantBackground.sentences)
                        && doc.feature.variantBackground.sentences.length > 0) {
                        testScenario.steps.push.apply(testScenario.steps, doc.feature.variantBackground.sentences.slice(0) // clone array
                        );
                    }
                    // Add Scenario's Variant Background steps
                    if (TypeChecking_1.isDefined(scenario.variantBackground)
                        && TypeChecking_1.isDefined(scenario.variantBackground.sentences)
                        && scenario.variantBackground.sentences.length > 0) {
                        testScenario.steps.push.apply(testScenario.steps, scenario.variantBackground.sentences.slice(0) // clone array
                        );
                    }
                    // Add Variant steps
                    testScenario.steps.push.apply(testScenario.steps, variant.sentences.slice(0) // clone array
                    );
                    // Both Features' Variant Background, Scenarios' Variant Background, and Variants
                    // may have Given steps with Preconditions. When steps are joined, they become out
                    // of order. So, let's move them to the beginning.
                    // This CHANGE steps, to they are deep cloned then changed.
                    testScenario.steps = stepUtil.movePreconditionStepsToTheBeginning(testScenario.steps, docLangContent.keywords);
                    // Set the "ignore" flag if the Feature or the Variant has such tag
                    if (this.hasIgnoreTag(variant.tags, doc.language)
                        || this.hasIgnoreTag(doc.feature.tags, doc.language)) {
                        testScenario.ignoreForTestCaseGeneration = true;
                    }
                    // Detect Preconditions, State Calls, and Postconditions of the Variant
                    this.detectVariantStates(variant, errors);
                    // Add postconditions as a system state and
                    // removes them from the test scenarios (just Then steps with state!)
                    for (let postc of variant.postconditions) {
                        // Removes the steps with postconditions
                        testScenario.steps.splice(postc.stepIndex, 1);
                    }
                    // Set the first step that occur after preconditions
                    const preconditionsCount = variant.preconditions.length;
                    if (preconditionsCount > 0) {
                        let lastPrecondition = variant.postconditions[preconditionsCount - 1];
                        // Reference, NOT INDEX ! ;)
                        testScenario.stepAfterPreconditions = testScenario.steps[lastPrecondition.stepIndex + 1];
                    }
                    else {
                        testScenario.stepAfterPreconditions = testScenario.steps[0];
                    }
                    // The same state may occur in more than one step. States
                    // with the same name are considered equal, so a map is
                    // used to avoid mapping test scenarios more than once.
                    // Extract preconditions' related test scenarios
                    let preconditionToTestScenariosMap = extractor.extractTestScenariosFromStatesBasedOnImports(doc, variant, variant.preconditions, variantSelectionStrategy);
                    // Extract state calls' related test scenarios
                    let stateCallToTestScenariosMap = extractor.extractTestScenariosFromStatesBasedOnImports(doc, variant, variant.stateCalls, variantSelectionStrategy);
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
    /**
     * Returns true whether the tag "ignore" is among the given tags.
     *
     * @param tags Tags to check
     * @param docLanguage Document language
     */
    hasIgnoreTag(tags, docLanguage) {
        const langContent = this._langContentLoader.load(docLanguage ? docLanguage.value : this._defaultLanguage);
        for (let name of langContent.keywords.tagIgnore || ['ignore']) {
            if (Tag_1.hasTagNamed(name, tags)) {
                return true;
            }
        }
        return false;
    }
}
exports.TestScenarioGenerator = TestScenarioGenerator;
class TestScenarioExtractor {
    constructor(stateMapper, spec, errors) {
        this.stateMapper = stateMapper;
        this.spec = spec;
        this.errors = errors;
    }
    extractTestScenariosFromStatesBasedOnImports(doc, variant, states, variantSelectionStrategy) {
        let map = new Map();
        for (let state of states || []) {
            // Already mapped ? -> ignore
            if (map.get(state.name) || null !== null) {
                continue;
            }
            // Retrieve state references
            let refs = this.stateMapper.stateProducersFromImports(state.name, doc.imports, this.spec);
            if (refs.length < 1) {
                const msg = 'State "' + state.name + '" is not produced by one of the Imports. Please Import the file that produces it or declare the state in a Then step.';
                const loc = variant.sentences[state.stepIndex].location || variant.location;
                const err = new RuntimeException_1.RuntimeException(msg, loc);
                this.errors.push(err);
                map.set(state.name, []);
                continue;
            }
            // Each state has references to many Variants
            // Let's reduce the Variants according to the given selection strategy
            let variants = refs.map(ref => ref.variant);
            variants = variantSelectionStrategy.select(variants);
            let testScenarios = [];
            for (let ref of refs) {
                // Ignore if ref's variant is not in the selected variants
                if (variants.indexOf(ref.variant) < 0
                    || !ref.testScenarios
                    || ref.testScenarios.length < 1) {
                    continue;
                }
                // TODO: clone scenario from the right steps if it is a state call ???
                // Add variant scenarios
                testScenarios.push.apply(testScenarios, ref.testScenarios);
            }
            map.set(state.name, testScenarios);
        }
        return map;
    }
}
//# sourceMappingURL=TestScenarioGenerator.js.map