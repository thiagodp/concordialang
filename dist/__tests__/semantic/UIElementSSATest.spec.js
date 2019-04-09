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
const path_1 = require("path");
const UIElementSSA_1 = require("../../modules/semantic/UIElementSSA");
const SimpleCompiler_1 = require("../../modules/util/SimpleCompiler");
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
const BatchSpecificationAnalyzer_1 = require("../../modules/semantic/BatchSpecificationAnalyzer");
describe('UIElementSSATest', () => {
    // @ts-ignore
    let sa; // under test
    const path = __dirname;
    let cp;
    beforeEach(() => {
        sa = new UIElementSSA_1.UIElementSSA();
        cp = new SimpleCompiler_1.SimpleCompiler();
    });
    afterEach(() => {
        cp = null;
        sa = null;
    });
    it('detect all references', () => __awaiter(this, void 0, void 0, function* () {
        let spec = new AugmentedSpec_1.AugmentedSpec(path);
        const mydbPath = path_1.join(__dirname, '../db/users.json');
        let doc1 = cp.addToSpec(spec, [
            '#language:pt',
            'Feature: Feature 1',
            'Constantes:',
            ' - "ipsum" é "ipsum_lorem"',
            ' - "pi" é 3.1416',
            'Elemento de IU: zoo',
            'Banco de Dados: mydb',
            ' - tipo é "json"',
            ' - caminho é "' + mydbPath + '"'
        ], { path: path_1.join(path, 'feature1.feature') });
        let doc2 = cp.addToSpec(spec, [
            '#language:pt',
            'import "feature1.feature"',
            '',
            'Feature: Feature 2',
            'Cenário: Cenário 1',
            'Elemento de IU: foo',
            'Elemento de IU: bar',
            ' - comprimento mínimo é [x]',
            ' - comprimento máximo é [pi]',
            ' - valor vem de "SELECT * FROM [mydb].[ipsum] WHERE name = {foo} OR name = {Feature 1:zoo}"',
            'Constantes:',
            ' - "x" é 2',
        ], { path: path_1.join(path, 'feature2.feature') });
        // console.log( spec.constantNames() );
        const specFilter = new SpecFilter_1.SpecFilter(spec);
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        let errors = [];
        yield batchSpecAnalyzer.analyze(specFilter.graph(), spec, errors);
        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        expect(errors).toEqual([]);
        const mydb = doc1.databases[0];
        const ipsum = doc1.constantBlock.items[0];
        const pi = doc1.constantBlock.items[1];
        const x = doc2.constantBlock.items[0];
        const zoo = doc1.feature.uiElements[0];
        const foo = doc2.feature.uiElements[0];
        const bar = doc2.feature.uiElements[1];
        expect(bar.items[0].value.references[0]).toEqual(x);
        expect(bar.items[1].value.references[0]).toEqual(pi);
        expect(bar.items[2].value.references[0]).toEqual(mydb);
        expect(bar.items[2].value.references[1]).toEqual(ipsum);
        expect(bar.items[2].value.references[2]).toEqual(foo);
        expect(bar.items[2].value.references[3]).toEqual(zoo);
    }));
});
