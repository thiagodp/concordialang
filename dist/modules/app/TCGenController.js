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
const path_1 = require("path");
const ast_1 = require("../ast");
const RuntimeException_1 = require("../error/RuntimeException");
const Warning_1 = require("../error/Warning");
const CombinationStrategy_1 = require("../selection/CombinationStrategy");
const VariantSelectionStrategy_1 = require("../selection/VariantSelectionStrategy");
const DataTestCaseMix_1 = require("../testcase/DataTestCaseMix");
const TCDocGen_1 = require("../testcase/TCDocGen");
const TCGen_1 = require("../testcase/TCGen");
const TestCaseFileGenerator_1 = require("../testcase/TestCaseFileGenerator");
const TestPlanner_1 = require("../testcase/TestPlanner");
const PreTestCaseGenerator_1 = require("../testscenario/PreTestCaseGenerator");
const TSGen_1 = require("../testscenario/TSGen");
const file_1 = require("../util/file");
const Defaults_1 = require("./Defaults");
class TCGenController {
    constructor(_variantSentenceRec, _langLoader, _listener, _fileWriter) {
        this._variantSentenceRec = _variantSentenceRec;
        this._langLoader = _langLoader;
        this._listener = _listener;
        this._fileWriter = _fileWriter;
    }
    execute(options, spec, graph) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            //
            // setup
            //
            const preTCGen = new PreTestCaseGenerator_1.PreTestCaseGenerator(this._variantSentenceRec, this._langLoader, options.language, options.realSeed, options.typedCaseUI(), options.randomMinStringSize, options.randomMaxStringSize, options.randomTriesToInvalidValue);
            let strategyWarnings = [];
            const variantSelectionStrategy = this.variantSelectionStrategyFromOptions(options, strategyWarnings);
            const stateCombinationStrategy = this.stateCombinationStrategyFromOptions(options, strategyWarnings);
            let variantToTestScenariosMap = new Map();
            let postconditionNameToVariantsMap = new Map();
            let tsGen = new TSGen_1.TSGen(preTCGen, variantSelectionStrategy, stateCombinationStrategy, variantToTestScenariosMap, postconditionNameToVariantsMap);
            const tcGen = new TCGen_1.TCGen(preTCGen);
            const testPlanMakers = this.testPlanMakersFromOptions(options, strategyWarnings);
            const tcDocGen = new TCDocGen_1.TCDocGen(options.extensionTestCase, options.directory);
            const tcDocFileGen = new TestCaseFileGenerator_1.TestCaseFileGenerator(this._langLoader, options.language);
            //
            // generation
            //
            this._listener.testCaseGenerationStarted(strategyWarnings);
            let vertices = graph.vertices_topologically();
            // for ( let [ key,  ] of vertices ) {
            //     console.log( key );
            // }
            let newTestCaseDocuments = [];
            for (let [/* key */ , value] of vertices) {
                let doc = value;
                if (!doc || !doc.feature || !doc.feature.scenarios) {
                    continue;
                }
                // console.log( 'doc is', doc.fileInfo.path);
                let errors = [];
                let warnings = [];
                let ctx = new PreTestCaseGenerator_1.GenContext(spec, doc, errors, warnings);
                let testCases = [];
                let scenarioIndex = 0;
                for (let scenario of doc.feature.scenarios || []) {
                    let variantIndex = 0;
                    for (let variant of scenario.variants || []) {
                        // Generating Test Scenarios
                        let testScenarios = [];
                        try {
                            testScenarios = yield tsGen.generate(ctx, variant);
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
                                generatedTC = yield tcGen.generate(ts, ctx, testPlanMakers);
                            }
                            catch (err) {
                                errors.push(err);
                                continue;
                            }
                            if (generatedTC.length < 1) {
                                continue;
                            }
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
                const newDoc = tcDocGen.generate(doc, testCases, options.dirTestCase);
                newTestCaseDocuments.push(newDoc);
                // Adding the generated documents to the graph
                // > This shall allow the test script generator to include all the needed test cases.
                const from = file_1.toUnixPath(newDoc.fileInfo.path);
                const to = file_1.toUnixPath(doc.fileInfo.path);
                graph.addVertex(from, newDoc); // Overwrites if exist!
                graph.addEdge(to, from); // order is this way...
                // Generating file content
                const lines = tcDocFileGen.createLinesFromDoc(newDoc, errors, options.tcSuppressHeader, options.tcIndenter);
                // Announce produced
                this._listener.testCaseProduced(path_1.relative(path_1.dirname(options.directory), newDoc.fileInfo.path), errors, warnings);
                // Generating file
                try {
                    yield this._fileWriter.write(newDoc.fileInfo.path, lines.join(options.lineBreaker));
                }
                catch (err) {
                    const msg = 'Error generating the file "' + newDoc.fileInfo.path + '": ' + err.message;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
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
            this._listener.testCaseGenerationFinished(durationMs);
            return [spec, graph];
        });
    }
    variantSelectionStrategyFromOptions(options, warnings) {
        const desired = options.typedVariantSelection();
        switch (desired) {
            case Defaults_1.VariantSelectionOptions.SINGLE_RANDOM:
                return new VariantSelectionStrategy_1.SingleRandomVariantSelectionStrategy(options.realSeed);
            case Defaults_1.VariantSelectionOptions.FIRST:
                return new VariantSelectionStrategy_1.FirstVariantSelectionStrategy();
            case Defaults_1.VariantSelectionOptions.FIRST_MOST_IMPORTANT:
                return new VariantSelectionStrategy_1.FirstMostImportantVariantSelectionStrategy(options.importance, [ast_1.ReservedTags.IMPORTANCE]);
            case Defaults_1.VariantSelectionOptions.ALL:
                return new VariantSelectionStrategy_1.AllVariantsSelectionStrategy();
            default: {
                const used = Defaults_1.VariantSelectionOptions.SINGLE_RANDOM.toString();
                const msg = 'Variant selection strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push(new Warning_1.Warning(msg));
                return new VariantSelectionStrategy_1.SingleRandomVariantSelectionStrategy(options.realSeed);
            }
        }
    }
    stateCombinationStrategyFromOptions(options, warnings) {
        return this.combinationStrategyFrom(options.typedStateCombination(), 'State', options, warnings);
    }
    combinationStrategyFrom(desired, name, options, warnings) {
        switch (desired) {
            case Defaults_1.CombinationOptions.SHUFFLED_ONE_WISE:
                return new CombinationStrategy_1.ShuffledOneWiseStrategy(options.realSeed);
            case Defaults_1.CombinationOptions.ONE_WISE:
                return new CombinationStrategy_1.OneWiseStrategy(options.realSeed);
            case Defaults_1.CombinationOptions.SINGLE_RANDOM_OF_EACH:
                return new CombinationStrategy_1.SingleRandomOfEachStrategy(options.realSeed);
            case Defaults_1.CombinationOptions.ALL:
                return new CombinationStrategy_1.CartesianProductStrategy();
            default: {
                const used = Defaults_1.CombinationOptions.SHUFFLED_ONE_WISE.toString();
                const msg = name + ' combination strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push(new Warning_1.Warning(msg));
                return new CombinationStrategy_1.ShuffledOneWiseStrategy(options.realSeed);
            }
        }
    }
    testPlanMakersFromOptions(options, warnings) {
        // INVALID DATA TEST CASES AT A TIME
        const none = Defaults_1.InvalidSpecialOptions.NONE.toString();
        const all = Defaults_1.InvalidSpecialOptions.ALL.toString();
        const random = Defaults_1.InvalidSpecialOptions.RANDOM.toString();
        const default_ = Defaults_1.InvalidSpecialOptions.DEFAULT.toString();
        let mixStrategy;
        const desired = String(options.combInvalid);
        switch (desired) {
            case '0': // next
            case none:
                mixStrategy = new DataTestCaseMix_1.OnlyValidMix();
                break;
            case '1':
                mixStrategy = new DataTestCaseMix_1.JustOneInvalidMix();
                break;
            case all:
                mixStrategy = new DataTestCaseMix_1.OnlyInvalidMix();
                break;
            case random: // next
            case default_:
                mixStrategy = new DataTestCaseMix_1.UnfilteredMix();
                break;
            default: {
                const used = random;
                const msg = 'Invalid data test case selection strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push(new Warning_1.Warning(msg));
                mixStrategy = new DataTestCaseMix_1.UnfilteredMix();
            }
        }
        // DATA TEST CASE COMBINATION
        const dataCombinationOption = desired === random
            ? Defaults_1.CombinationOptions.SHUFFLED_ONE_WISE
            : options.typedDataCombination();
        // console.log( 'options.invalid', options.invalid, 'desired', desired, 'dataCombinationOption', dataCombinationOption );
        let combinationStrategy = this.combinationStrategyFrom(dataCombinationOption, 'Data', options, warnings);
        return [
            new TestPlanner_1.TestPlanner(mixStrategy, combinationStrategy, options.realSeed)
        ];
    }
}
exports.TCGenController = TCGenController;
