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
const PreTestCaseGenerator_1 = require("../../modules/testscenario/PreTestCaseGenerator");
const SimpleCompiler_1 = require("../../modules/util/SimpleCompiler");
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
const BatchSpecificationAnalyzer_1 = require("../../modules/semantic/BatchSpecificationAnalyzer");
const TestPlanner_1 = require("../../modules/testcase/TestPlanner");
const DataTestCaseMix_1 = require("../../modules/testcase/DataTestCaseMix");
const CombinationStrategy_1 = require("../../modules/selection/CombinationStrategy");
const RandomString_1 = require("../../modules/testdata/random/RandomString");
const Random_1 = require("../../modules/testdata/random/Random");
const LongLimits_1 = require("../../modules/testdata/limits/LongLimits");
describe('PreTestCaseGeneratorTest', () => {
    let gen; // under test
    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let cp;
    beforeEach(() => {
        cp = new SimpleCompiler_1.SimpleCompiler(LANGUAGE);
        gen = new PreTestCaseGenerator_1.PreTestCaseGenerator(cp.nlpRec.variantSentenceRec, cp.langLoader, cp.language, SEED);
    });
    afterEach(() => {
        cp = null;
        gen = null;
    });
    it('replaces Constants by their values', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho <a> com [ipsum]',
            '    E eu preencho <b> com [pi]',
            ' Então eu tenho ~foo~',
            'Constantes:',
            ' - "ipsum" é "ip!"',
            ' - "pi" é 3.14'
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.SingleRandomOfEachStrategy(SEED), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        expect(lines).toEqual([
            'Quando eu preencho <a> com "ip!" # [ipsum]',
            'E eu preencho <b> com 3.14 # [pi]',
            'Então eu tenho ~foo~'
        ]);
    }));
    it('replaces UI Elements with values by their literals', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho {A} com "ip!"',
            '    E eu preencho {B} com 3.14',
            ' Então eu tenho ~foo~',
            'Elemento de IU: A',
            ' - id é "aa"',
            'Elemento de IU: B',
            ' - id é "bb"',
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.SingleRandomOfEachStrategy(SEED), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(warnings).toHaveLength(0);
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        expect(lines).toEqual([
            'Quando eu preencho <aa> com "ip!" # {A}',
            'E eu preencho <bb> com 3.14 # {B}',
            'Então eu tenho ~foo~'
        ]);
    }));
    it('replaces UI Elements with Constants by their literals and values', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho {A} com [ipsum]',
            '    E eu preencho {B} com [pi]',
            ' Então eu tenho ~foo~',
            'Elemento de IU: A',
            ' - id é "aa"',
            'Elemento de IU: B',
            ' - id é "bb"',
            'Constantes:',
            ' - "ipsum" é "ip!"',
            ' - "pi" é 3.14',
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.SingleRandomOfEachStrategy(SEED), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(warnings).toHaveLength(0);
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        expect(lines).toEqual([
            'Quando eu preencho <aa> com "ip!" # {A} [ipsum]',
            'E eu preencho <bb> com 3.14 # {B} [pi]',
            'Então eu tenho ~foo~'
        ]);
    }));
    it('fills UI Literals without value with random value', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho <a>',
            '    E eu preencho <b> com "foo"',
            '    E eu preencho <c>',
            ' Então eu tenho ~foo~',
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.SingleRandomOfEachStrategy(SEED), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        // expect( errors ).toHaveLength( 0 );
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        const rand = new RandomString_1.RandomString(new Random_1.Random(SEED));
        const value1 = rand.between(gen.minRandomStringSize, gen.maxRandomStringSize);
        const value2 = rand.between(gen.minRandomStringSize, gen.maxRandomStringSize);
        const comment1 = '# válido: aleatório';
        const comment2 = '# válido: aleatório';
        expect(lines).toEqual([
            'Quando eu preencho <a> com "' + value1 + '" ' + comment1,
            'E eu preencho <b> com "foo"',
            'E eu preencho <c> com "' + value2 + '" ' + comment2,
            'Então eu tenho ~foo~'
        ]);
    }));
    it('fills UI Elements without value with generated value', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho {A}',
            '    E eu preencho <b> com "foo"',
            '    E eu preencho {C}',
            ' Então eu tenho ~foo~',
            'Elemento de IU: A',
            'Elemento de IU: C'
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.IndexOfEachStrategy(1), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        const value1 = '';
        const value2 = '';
        const comment1 = '# {A}, válido: não preenchido';
        const comment2 = '# {C}, válido: não preenchido';
        expect(lines).toEqual([
            'Quando eu preencho <a> com "' + value1 + '" ' + comment1,
            'E eu preencho <b> com "foo"',
            'E eu preencho <c> com "' + value2 + '" ' + comment2,
            'Então eu tenho ~foo~'
        ]);
    }));
    it('separates UI literals and UI Elements', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho {A}, <b>, {C} e <d>',
            '  Então eu tenho ~foo~',
            'Elemento de IU: A',
            'Elemento de IU: C'
        ], { path: 'doc1.feature', hash: 'doc1' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner_1.TestPlanner(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.IndexOfEachStrategy(1), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        const variant1 = doc1.feature.scenarios[0].variants[0];
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        // expect( errors ).toHaveLength( 0 );
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        const value1 = '';
        const value2 = '';
        const comment1Value = '# {A}, válido: não preenchido';
        const comment2Value = '# {C}, válido: não preenchido';
        const randStr = new RandomString_1.RandomString(new Random_1.Random(SEED));
        const random1 = randStr.between(gen.minRandomStringSize, gen.maxRandomStringSize);
        const random2 = randStr.between(gen.minRandomStringSize, gen.maxRandomStringSize);
        const commentRandom = '# válido: aleatório';
        expect(lines).toEqual([
            'Quando eu preencho <a> com "' + value1 + '" ' + comment1Value,
            'E eu preencho <b> com "' + random1 + '" ' + commentRandom,
            'E eu preencho <c> com "' + value2 + '" ' + comment2Value,
            'E eu preencho <d> com "' + random2 + '" ' + commentRandom,
            'Então eu tenho ~foo~'
        ]);
    }));
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
        const preTestCases = yield gen.generate(variant1.sentences, ctx1, testPlanMakers);
        expect(errors).toHaveLength(0);
        expect(preTestCases).toHaveLength(1);
        const preTC = preTestCases[0];
        // Content + Comment
        const lines = preTC.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        const value1 = LongLimits_1.LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';
        expect(lines).toEqual([
            'Quando eu preencho <a> com ' + value1 + ' ' + comment,
            'E eu preencho <b> com "foo"',
            'Então eu devo ver "x"'
        ]);
        // Content + Comment
        const oracleLines = preTC.oracles.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        expect(oracleLines).toEqual([
            'Então eu devo ver a mensagem "bar" # de <a>' // << Otherwise is replaced by Then
        ]);
    }));
});
