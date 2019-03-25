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
const TCGen_1 = require("../../modules/testcase/TCGen");
const SimpleCompiler_1 = require("../../modules/util/SimpleCompiler");
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const PreTestCaseGenerator_1 = require("../../modules/testscenario/PreTestCaseGenerator");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
const BatchSpecificationAnalyzer_1 = require("../../modules/semantic/BatchSpecificationAnalyzer");
const TestPlanner_1 = require("../../modules/testcase/TestPlanner");
const DataTestCaseMix_1 = require("../../modules/testcase/DataTestCaseMix");
const CombinationStrategy_1 = require("../../modules/selection/CombinationStrategy");
const TestScenario_1 = require("../../modules/testscenario/TestScenario");
const LongLimits_1 = require("../../modules/testdata/limits/LongLimits");
describe('TCGenTest', () => {
    let gen; // under test
    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let preTCGen;
    let cp;
    beforeEach(() => {
        cp = new SimpleCompiler_1.SimpleCompiler(LANGUAGE);
        preTCGen = new PreTestCaseGenerator_1.PreTestCaseGenerator(cp.nlpRec.variantSentenceRec, cp.langLoader, cp.language, SEED);
        gen = new TCGen_1.TCGen(preTCGen);
    });
    afterEach(() => {
        cp = null;
        preTCGen = null;
        gen = null;
    });
    it('generates invalid values and oracles based on UI Element properties', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho {A}',
            '    E eu preencho <b> com "foo"',
            ' Então eu devo ver "x"',
            'Elemento de IU: A',
            ' - valor mínimo é 5',
            '   Caso contrário, eu devo ver a mensagem "bar"' // <<< oracle
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.JustOneInvalidMix(), new CombinationStrategy_1.IndexOfEachStrategy(0), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        let ts = new TestScenario_1.TestScenario();
        ts.steps = variant1.sentences;
        const testCases = yield gen.generate(ts, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(testCases).toHaveLength(1);
        const tc = testCases[0];
        // Content + Comment
        const lines = tc.sentences.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        const value1 = LongLimits_1.LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';
        expect(lines).toEqual([
            'Quando eu preencho <a> com ' + value1 + ' ' + comment,
            'E eu preencho <b> com "foo"',
            'Então eu devo ver a mensagem "bar" # de <a>' // << Then replaced with the oracle
        ]);
        expect(tc.shoudFail).toBeFalsy();
    }));
    it('indicates that should fail when no Otherwise is declared and has Then sentence withou state', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho {A}',
            '    E eu preencho <b> com "foo"',
            ' Então eu devo ver "x"',
            'Elemento de IU: A',
            ' - valor mínimo é 5'
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.JustOneInvalidMix(), new CombinationStrategy_1.IndexOfEachStrategy(0), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        let ts = new TestScenario_1.TestScenario();
        ts.steps = variant1.sentences;
        const testCases = yield gen.generate(ts, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(testCases).toHaveLength(1);
        const tc = testCases[0];
        // Content + Comment
        const lines = tc.sentences.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        const value1 = LongLimits_1.LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';
        expect(lines).toEqual([
            'Quando eu preencho <a> com ' + value1 + ' ' + comment,
            'E eu preencho <b> com "foo"',
            'Então eu devo ver "x"' // << same Then statement
        ]);
        expect(tc.shoudFail).toBeTruthy();
        // ---
        // let docGen = new TCDocGen( '.testcase' );
        // let newDoc = docGen.generate( doc1, testCases );
        // let linesGen = new TestCaseFileGenerator( cp.langLoader, cp.language );
        // let fileLines = linesGen.createLinesFromDoc( newDoc, errors );
        // console.log( fileLines );
    }));
});
