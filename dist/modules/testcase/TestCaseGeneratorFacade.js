import * as enumUtil from 'enum-util';
import { CombinationOptions, InvalidSpecialOptions, VariantSelectionOptions } from '../app/combination-options';
import { DEFAULT_CASE_UI, DEFAULT_DATA_TEST_CASE_COMBINATION, DEFAULT_STATE_COMBINATION, DEFAULT_VARIANT_SELECTION, } from '../app/default-options';
import { ReservedTags } from '../ast';
import { RuntimeException } from '../error/RuntimeException';
import { Warning } from '../error/Warning';
import { CartesianProductStrategy, OneWiseStrategy, ShuffledOneWiseStrategy, SingleRandomOfEachStrategy, } from '../selection/CombinationStrategy';
import { AllVariantsSelectionStrategy, FirstMostImportantVariantSelectionStrategy, FirstVariantSelectionStrategy, SingleRandomVariantSelectionStrategy, } from '../selection/VariantSelectionStrategy';
import { GenContext, PreTestCaseGenerator } from '../testscenario/PreTestCaseGenerator';
import { TestScenarioGenerator } from '../testscenario/TestScenarioGenerator';
import { CaseType } from '../util/CaseType';
import { toUnixPath } from '../util/file';
import { JustOneInvalidMix, OnlyInvalidMix, OnlyValidMix, UnfilteredMix } from './DataTestCaseMix';
import { TestCaseDocumentGenerator } from './TestCaseDocumentGenerator';
import { TestCaseFileGenerator } from './TestCaseFileGenerator';
import { TestCaseGenerator } from './TestCaseGenerator';
import { TestPlanner } from './TestPlanner';
function toCaseType(caseUi) {
    if (enumUtil.isValue(CaseType, caseUi)) {
        return caseUi;
    }
    if (enumUtil.isValue(CaseType, DEFAULT_CASE_UI)) {
        return DEFAULT_CASE_UI;
    }
    return CaseType.CAMEL;
}
function toVariantSelectionOptions(combVariant) {
    if (enumUtil.isValue(VariantSelectionOptions, combVariant)) {
        return combVariant;
    }
    if (enumUtil.isValue(VariantSelectionOptions, DEFAULT_VARIANT_SELECTION)) {
        return DEFAULT_VARIANT_SELECTION;
    }
    return VariantSelectionOptions.SINGLE_RANDOM;
}
function typedStateCombination(combState) {
    return typedCombinationFor(combState, DEFAULT_STATE_COMBINATION);
}
function typedDataCombination(combData) {
    return typedCombinationFor(combData, DEFAULT_DATA_TEST_CASE_COMBINATION);
}
function typedCombinationFor(value, defaultValue) {
    if (enumUtil.isValue(CombinationOptions, value)) {
        return value;
    }
    if (enumUtil.isValue(CombinationOptions, defaultValue)) {
        return defaultValue;
    }
    return CombinationOptions.SHUFFLED_ONE_WISE;
}
/**
 * Test Case Generator Facade
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseGeneratorFacade {
    constructor(_variantSentenceRec, _languageMap, _listener, _fileHandler) {
        this._variantSentenceRec = _variantSentenceRec;
        this._languageMap = _languageMap;
        this._listener = _listener;
        this._fileHandler = _fileHandler;
    }
    async execute(options, spec, graph) {
        const startTime = Date.now();
        //
        // setup
        //
        const preTCGen = new PreTestCaseGenerator(this._variantSentenceRec, this._languageMap, options.language, options.realSeed, toCaseType(options.caseUi), options.randomMinStringSize, options.randomMaxStringSize, options.randomTriesToInvalidValue);
        let strategyWarnings = [];
        const variantSelectionStrategy = this.variantSelectionStrategyFromOptions(options, strategyWarnings);
        const stateCombinationStrategy = this.stateCombinationStrategyFromOptions(options, strategyWarnings);
        let variantToTestScenariosMap = new Map();
        let postconditionNameToVariantsMap = new Map();
        let tsGen = new TestScenarioGenerator(preTCGen, variantSelectionStrategy, stateCombinationStrategy, variantToTestScenariosMap, postconditionNameToVariantsMap);
        const tcGen = new TestCaseGenerator(preTCGen);
        const testPlanMakers = this.testPlanMakersFromOptions(options, strategyWarnings);
        const tcDocGen = new TestCaseDocumentGenerator(options.extensionFeature, options.extensionTestCase, options.directory);
        const tcDocFileGen = new TestCaseFileGenerator(options.language);
        //
        // generation
        //
        this._listener.testCaseGenerationStarted(strategyWarnings);
        let vertices = graph.vertices_topologically();
        // for ( let [ key,  ] of vertices ) {
        //     console.log( key );
        // }
        let newTestCaseDocuments = [];
        let totalTestCasesCount = 0;
        for (let [/* key */ , value] of vertices) {
            let doc = value;
            if (!doc || !doc.feature || !doc.feature.scenarios) {
                totalTestCasesCount += doc.testCases?.length || 0;
                continue;
            }
            // console.log( 'doc is', doc.fileInfo.path);
            let errors = [];
            let warnings = [];
            let ctx = new GenContext(spec, doc, errors, warnings);
            let testCases = [];
            let scenarioIndex = 0;
            for (let scenario of doc.feature.scenarios || []) {
                let variantIndex = 0;
                for (let variant of scenario.variants || []) {
                    // Generating Test Scenarios
                    let testScenarios = [];
                    try {
                        testScenarios = await tsGen.generate(ctx, variant);
                        // console.log( 'test scenarios:', testScenarios );
                    }
                    catch (err) {
                        errors.push(err);
                        continue;
                    }
                    let tsIndex = 0;
                    for (let ts of testScenarios) {
                        // Generating Test Cases
                        let generatedTC = [];
                        try {
                            generatedTC = await tcGen.generate(ts, ctx, testPlanMakers);
                            // console.log( 'generated TC', generatedTC );
                        }
                        catch (err) {
                            errors.push(err);
                            // console.log( 'ERRO --->', err );
                            continue;
                        }
                        if (generatedTC.length < 1) {
                            continue;
                        }
                        // ++totalTestCasesCount;
                        let tcIndex = 1;
                        for (let tc of generatedTC) {
                            tcGen.addReferenceTagsTo(tc, scenarioIndex + 1, variantIndex + 1);
                            tc.name = (variant.name || scenario.name) + ' - ' + (tcIndex + tsIndex);
                            ++tcIndex;
                        }
                        ++tsIndex;
                        testCases.push.apply(testCases, generatedTC);
                    }
                    ++variantIndex;
                }
                ++scenarioIndex;
            }
            // Generating Documents with the Test Cases
            const newDoc = tcDocGen.generate(doc, testCases);
            // Erase existing test case files when there is no test cases
            if (testCases.length < 1) {
                try {
                    await this._fileHandler.erase(newDoc.fileInfo.path, true);
                    continue;
                }
                catch (err) {
                    errors.push(err);
                }
            }
            newTestCaseDocuments.push(newDoc);
            // Adding the generated documents to the graph
            // > This shall allow the test script generator to include all the needed test cases.
            const from = toUnixPath(newDoc.fileInfo.path);
            const to = toUnixPath(doc.fileInfo.path);
            graph.addVertex(from, newDoc); // Overwrites if exist!
            graph.addEdge(to, from); // order is this way...
            // console.log( '>>> NEW TEST CASE', newDoc.fileInfo.path );
            // Generating file content
            const lines = tcDocFileGen.createLinesFromDoc(newDoc, errors, options.tcSuppressHeader, options.tcIndenter);
            // Announce produced
            this._listener.testCaseProduced(options.directory, newDoc.fileInfo.path, newDoc.testCases.length, errors, warnings);
            // Generating file
            try {
                await this._fileHandler.write(newDoc.fileInfo.path, lines.join(options.lineBreaker));
            }
            catch (err) {
                const msg = 'Error generating the file "' + newDoc.fileInfo.path + '": ' + err.message;
                errors.push(new RuntimeException(msg));
            }
        }
        // console.log( 'BEFORE');
        // for ( let d of spec.docs ) {
        //     console.log( ' DOC', d.fileInfo.path );
        // }
        // Adds or replaces generated documents to the specification
        for (let newDoc of newTestCaseDocuments) {
            // console.log( 'NEW is', newDoc.fileInfo.path );
            const index = spec.indexOfDocWithPath(newDoc.fileInfo.path);
            if (index < 0) {
                // console.log( ' ADD', newDoc.fileInfo.path );
                // spec.docs.push( newDoc );
                spec.addDocument(newDoc);
            }
            else {
                // console.log( ' REPLACE', newDoc.fileInfo.path );
                // spec.docs.splice( index, 1, newDoc ); // Replace
                spec.replaceDocByIndex(index, newDoc);
            }
        }
        // Show errors and warnings if they exist
        const durationMs = Date.now() - startTime;
        this._listener.testCaseGenerationFinished(newTestCaseDocuments.length, totalTestCasesCount, durationMs);
        return [spec, graph];
    }
    variantSelectionStrategyFromOptions(options, warnings) {
        const desired = toVariantSelectionOptions(options.combVariant);
        switch (desired) {
            case VariantSelectionOptions.SINGLE_RANDOM:
                return new SingleRandomVariantSelectionStrategy(options.realSeed);
            case VariantSelectionOptions.FIRST:
                return new FirstVariantSelectionStrategy();
            case VariantSelectionOptions.FIRST_MOST_IMPORTANT:
                return new FirstMostImportantVariantSelectionStrategy(options.importance, [ReservedTags.IMPORTANCE]);
            case VariantSelectionOptions.ALL:
                return new AllVariantsSelectionStrategy();
            default: {
                const used = VariantSelectionOptions.SINGLE_RANDOM.toString();
                const msg = 'Variant selection strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push(new Warning(msg));
                return new SingleRandomVariantSelectionStrategy(options.realSeed);
            }
        }
    }
    stateCombinationStrategyFromOptions(options, warnings) {
        return this.combinationStrategyFrom(typedStateCombination(options.combState), 'State', options, warnings);
    }
    combinationStrategyFrom(desired, name, options, warnings) {
        switch (desired) {
            case CombinationOptions.SHUFFLED_ONE_WISE:
                return new ShuffledOneWiseStrategy(options.realSeed);
            case CombinationOptions.ONE_WISE:
                return new OneWiseStrategy(options.realSeed);
            case CombinationOptions.SINGLE_RANDOM_OF_EACH:
                return new SingleRandomOfEachStrategy(options.realSeed);
            case CombinationOptions.ALL:
                return new CartesianProductStrategy();
            default: {
                const used = CombinationOptions.SHUFFLED_ONE_WISE.toString();
                const msg = name + ' combination strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push(new Warning(msg));
                return new ShuffledOneWiseStrategy(options.realSeed);
            }
        }
    }
    testPlanMakersFromOptions(options, warnings) {
        // INVALID DATA TEST CASES AT A TIME
        const none = InvalidSpecialOptions.NONE.toString();
        const all = InvalidSpecialOptions.ALL.toString();
        const random = InvalidSpecialOptions.RANDOM.toString();
        const default_ = InvalidSpecialOptions.DEFAULT.toString();
        let mixStrategy;
        const desired = String(options.combInvalid);
        switch (desired) {
            case '0': // next
            case none:
                mixStrategy = new OnlyValidMix();
                break;
            case '1':
                mixStrategy = new JustOneInvalidMix();
                break;
            case all:
                mixStrategy = new OnlyInvalidMix();
                break;
            case random: // next
            case default_:
                mixStrategy = new UnfilteredMix();
                break;
            default: {
                const used = random;
                const msg = 'Invalid data test case selection strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push(new Warning(msg));
                mixStrategy = new UnfilteredMix();
            }
        }
        // DATA TEST CASE COMBINATION
        const dataCombinationOption = desired === random
            ? CombinationOptions.SHUFFLED_ONE_WISE
            : typedDataCombination(options.combData);
        // console.log( 'options.invalid', options.invalid, 'desired', desired, 'dataCombinationOption', dataCombinationOption );
        let combinationStrategy = this.combinationStrategyFrom(dataCombinationOption, 'Data', options, warnings);
        return [
            new TestPlanner(mixStrategy, combinationStrategy, options.realSeed)
        ];
    }
}
