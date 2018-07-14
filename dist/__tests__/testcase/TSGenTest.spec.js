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
const TSGen_1 = require("../../modules/testscenario/TSGen");
const CombinationStrategy_1 = require("../../modules/selection/CombinationStrategy");
const VariantSelectionStrategy_1 = require("../../modules/selection/VariantSelectionStrategy");
const Spec_1 = require("../../modules/ast/Spec");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
const BatchSpecificationAnalyzer_1 = require("../../modules/semantic/BatchSpecificationAnalyzer");
const TestPlanMaker_1 = require("../../modules/testcase/TestPlanMaker");
const DataTestCaseMix_1 = require("../../modules/testcase/DataTestCaseMix");
describe('TSGen', () => {
    let gen = null;
    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let preTCGen;
    let cp;
    beforeEach(() => {
        cp = new SimpleCompiler_1.SimpleCompiler(LANGUAGE);
        preTCGen = new PreTestCaseGenerator_1.PreTestCaseGenerator(cp.nlpRec.variantSentenceRec, cp.langLoader, cp.language, SEED);
        gen = new TSGen_1.TSGen(preTCGen, new VariantSelectionStrategy_1.AllVariantsSelectionStrategy(), new CombinationStrategy_1.CartesianProductStrategy(), new Map(), new Map());
    });
    afterEach(() => {
        cp = null;
        preTCGen = null;
        gen = null;
    });
    it('combines states', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new Spec_1.Spec('.');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Funcionalidade: A',
            'Cenário: A',
            'Variante: Aa',
            '  Dado que vejo "A"',
            '  Então eu tenho ~X~',
        ], { path: 'doc1.feature', hash: 'doc1' });
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'Funcionalidade: B',
            'Cenário: B',
            'Variante: Bb',
            '  Dado que vejo "B"',
            '  Então eu tenho ~X~',
        ], { path: 'doc2.feature', hash: 'doc2' });
        let doc3 = cp.addToSpec(spec, [
            '#language:pt',
            'importe "doc1.feature"',
            'importe "doc2.feature"',
            'Funcionalidade: C',
            'Cenário: C',
            'Variante: Cc',
            '  Dado que eu tenho ~X~',
            '  Quando eu vejo o texto "C"',
            '  Então eu tenho ~C~',
        ], { path: 'doc3.feature', hash: 'doc3' });
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [], warnings = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        const testPlanMakers = [
            new TestPlanMaker_1.TestPlanMaker(new DataTestCaseMix_1.OnlyValidMix(), new CombinationStrategy_1.CartesianProductStrategy(), SEED)
        ];
        const ctx1 = new PreTestCaseGenerator_1.GenContext(spec, doc3, errors, warnings);
        const variant1 = doc3.feature.scenarios[0].variants[0];
        const testScenarios = yield gen.generate(ctx1, variant1);
        expect(errors).toHaveLength(0);
        expect(testScenarios).toHaveLength(2);
        const ts = testScenarios[0];
        // Content + Comment
        const lines = ts.steps.map(s => s.content + (!s.comment ? '' : ' #' + s.comment));
        expect(lines).toEqual([
            'Foo'
        ]);
    }));
});
