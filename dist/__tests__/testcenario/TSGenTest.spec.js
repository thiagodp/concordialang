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
const TSGen_1 = require("../../modules/testscenario/TSGen");
const SimpleCompiler_1 = require("../../modules/util/SimpleCompiler");
const VariantSelectionStrategy_1 = require("../../modules/selection/VariantSelectionStrategy");
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const BatchSpecificationAnalyzer_1 = require("../../modules/semantic/BatchSpecificationAnalyzer");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
const CombinationStrategy_1 = require("../../modules/selection/CombinationStrategy");
const PreTestCaseGenerator_1 = require("../../modules/testscenario/PreTestCaseGenerator");
describe('TSGenTest', () => {
    let gen = null; // under test
    let ptcGen;
    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let cp;
    let variantToTestScenariosMap;
    let postconditionNameToVariantsMap;
    beforeEach(() => {
        cp = new SimpleCompiler_1.SimpleCompiler(LANGUAGE);
        variantToTestScenariosMap = new Map();
        postconditionNameToVariantsMap = new Map();
        ptcGen = new PreTestCaseGenerator_1.PreTestCaseGenerator(cp.nlpRec.variantSentenceRec, cp.langLoader, cp.language, SEED);
        gen = new TSGen_1.TSGen(ptcGen, new VariantSelectionStrategy_1.AllVariantsSelectionStrategy(), new CombinationStrategy_1.CartesianProductStrategy(), variantToTestScenariosMap, postconditionNameToVariantsMap);
    });
    afterEach(() => {
        variantToTestScenariosMap = null;
        postconditionNameToVariantsMap = null;
        ptcGen = null;
        cp = null;
        gen = null;
    });
    it('generates for a single Variant without preconditions', () => __awaiter(this, void 0, void 0, function* () {
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
        let errors = [];
        let warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
    }));
    it('includes other TS based on precondition', () => __awaiter(this, void 0, void 0, function* () {
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
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc1.feature"',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu tenho ~foo~',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"'
        ], { path: 'doc2.feature', hash: 'doc2' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
        let ctx2 = new PreTestCaseGenerator_1.GenContext(spec, doc2, errors, warnings);
        let variant2 = doc2.feature.scenarios[0].variants[0];
        let ts2 = yield gen.generate(ctx2, variant2);
        expect(errors).toHaveLength(0);
        expect(ts2).toHaveLength(1);
        const expectedSteps = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"'
        ];
        const stepsContent = ts2[0].steps.map(s => s.content);
        expect(stepsContent).toEqual(expectedSteps);
    }));
    it('gets an error when precondition requires a state not declared', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu tenho ~foo~',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"'
        ], { path: 'doc2.feature', hash: 'doc2' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        let ctx = new PreTestCaseGenerator_1.GenContext(spec, doc, errors, warnings);
        let variant = doc.feature.scenarios[0].variants[0];
        let ts = yield gen.generate(ctx, variant);
        expect(errors).toHaveLength(1);
        expect(ts).toHaveLength(0);
    }));
    it('replaces orfan postcondition AND steps with THEN', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Scenario: Foo',
            'Variant: Foo',
            '  Quando eu preencho <a> com [ipsum]',
            '    E eu preencho <b> com [pi]',
            ' Então eu tenho ~foo~',
            '   e eu vejo "foo"',
            'Constantes:',
            ' - "ipsum" é "ip!"',
            ' - "pi" é 3.14'
        ], { path: 'doc1.feature', hash: 'doc1' });
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc1.feature"',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu tenho ~foo~',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"'
        ], { path: 'doc2.feature', hash: 'doc2' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
        let ctx2 = new PreTestCaseGenerator_1.GenContext(spec, doc2, errors, warnings);
        let variant2 = doc2.feature.scenarios[0].variants[0];
        let ts2 = yield gen.generate(ctx2, variant2);
        expect(errors).toHaveLength(0);
        expect(ts2).toHaveLength(1);
        const expectedSteps = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Então eu vejo "foo"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"'
        ];
        const stepsContent = ts2[0].steps.map(s => s.content);
        expect(stepsContent).toEqual(expectedSteps);
    }));
    it('replaces orfan precondition AND steps with GIVEN', () => __awaiter(this, void 0, void 0, function* () {
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
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc1.feature"',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu tenho ~foo~',
            '    E eu vejo "bar"',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"',
            '  Então eu vejo "baz"'
        ], { path: 'doc2.feature', hash: 'doc2' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
        let ctx2 = new PreTestCaseGenerator_1.GenContext(spec, doc2, errors, warnings);
        let variant2 = doc2.feature.scenarios[0].variants[0];
        let ts2 = yield gen.generate(ctx2, variant2);
        expect(errors).toHaveLength(0);
        expect(ts2).toHaveLength(1);
        const expectedSteps = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Então eu vejo "baz"'
        ];
        const stepsContent = ts2[0].steps.map(s => s.content);
        expect(stepsContent).toEqual(expectedSteps);
    }));
    it('replaces state calls', () => __awaiter(this, void 0, void 0, function* () {
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
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc1.feature"',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu vejo "bar"',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"',
            '    E eu tenho ~foo~',
            '  Então eu vejo "baz"'
        ], { path: 'doc2.feature', hash: 'doc2' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
        let ctx2 = new PreTestCaseGenerator_1.GenContext(spec, doc2, errors, warnings);
        let variant2 = doc2.feature.scenarios[0].variants[0];
        let ts2 = yield gen.generate(ctx2, variant2);
        expect(errors).toHaveLength(0);
        expect(ts2).toHaveLength(1);
        const expectedSteps = [
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Então eu vejo "baz"'
        ];
        const stepsContent = ts2[0].steps.map(s => s.content);
        expect(stepsContent).toEqual(expectedSteps);
    }));
    it('includes preconditions of preconditions', () => __awaiter(this, void 0, void 0, function* () {
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
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc1.feature"',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu tenho ~foo~',
            '    E eu vejo "bar"',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"',
            '  Então eu vejo "baz"',
            '    e eu tenho ~bar~'
        ], { path: 'doc2.feature', hash: 'doc2' });
        let doc3 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc2.feature"',
            'Feature: Feature 3',
            'Scenario: Zoo',
            'Variant: Zoo',
            '  Dado que eu tenho ~bar~',
            '    E eu vejo "zoo"',
            '  Quando eu preencho <x> com "x"',
            '    E eu preencho <y> com "Y"',
            '  Então eu vejo "zoo"'
        ], { path: 'doc3.feature', hash: 'doc3' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
        let ctx2 = new PreTestCaseGenerator_1.GenContext(spec, doc2, errors, warnings);
        let variant2 = doc2.feature.scenarios[0].variants[0];
        let ts2 = yield gen.generate(ctx2, variant2);
        expect(errors).toHaveLength(0);
        expect(ts2).toHaveLength(1);
        let ctx3 = new PreTestCaseGenerator_1.GenContext(spec, doc3, errors, warnings);
        let variant3 = doc3.feature.scenarios[0].variants[0];
        let ts3 = yield gen.generate(ctx3, variant3);
        expect(errors).toHaveLength(0);
        expect(ts3).toHaveLength(1);
        const expectedSteps = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Então eu vejo "baz"',
            'Dado que eu vejo "zoo"',
            'Quando eu preencho <x> com "x"',
            'E eu preencho <y> com "Y"',
            'Então eu vejo "zoo"'
        ];
        const stepsContent = ts3[0].steps.map(s => s.content);
        expect(stepsContent).toEqual(expectedSteps);
    }));
    it('does not include preconditions of state calls', () => __awaiter(this, void 0, void 0, function* () {
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
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc1.feature"',
            'Feature: Feature 2',
            'Scenario: Bar',
            'Variant: Bar',
            '  Dado que eu tenho ~foo~',
            '    E eu vejo "bar"',
            '  Quando eu preencho <c> com "c"',
            '    E eu preencho <d> com "d"',
            '  Então eu vejo "baz"',
            '    e eu tenho ~bar~'
        ], { path: 'doc2.feature', hash: 'doc2' });
        let doc3 = cp.addToSpec(spec, [
            '#language:pt',
            'Import "doc2.feature"',
            'Feature: Feature 3',
            'Scenario: Zoo',
            'Variant: Zoo',
            '  Dado que eu vejo "zoo"',
            '  Quando eu tenho ~bar~',
            '    E eu preencho <x> com "x"',
            '    E eu preencho <y> com "Y"',
            '  Então eu vejo "zoo"'
        ], { path: 'doc3.feature', hash: 'doc3' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc1, errors, warnings);
        let variant1 = doc1.feature.scenarios[0].variants[0];
        let ts1 = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(ts1).toHaveLength(1);
        let ctx2 = new PreTestCaseGenerator_1.GenContext(spec, doc2, errors, warnings);
        let variant2 = doc2.feature.scenarios[0].variants[0];
        let ts2 = yield gen.generate(ctx2, variant2);
        expect(errors).toHaveLength(0);
        expect(ts2).toHaveLength(1);
        let ctx3 = new PreTestCaseGenerator_1.GenContext(spec, doc3, errors, warnings);
        let variant3 = doc3.feature.scenarios[0].variants[0];
        let ts3 = yield gen.generate(ctx3, variant3);
        expect(errors).toHaveLength(0);
        expect(ts3).toHaveLength(1);
        const expectedSteps = [
            'Dado que eu vejo "zoo"',
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Então eu vejo "baz"',
            'Quando eu preencho <x> com "x"',
            'E eu preencho <y> com "Y"',
            'Então eu vejo "zoo"'
        ];
        const stepsContent = ts3[0].steps.map(s => s.content);
        expect(stepsContent).toEqual(expectedSteps);
    }));
});
