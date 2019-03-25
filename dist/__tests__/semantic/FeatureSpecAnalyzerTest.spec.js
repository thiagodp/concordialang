"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureSSA_1 = require("../../modules/semantic/FeatureSSA");
const Parser_1 = require("../../modules/parser/Parser");
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const Options_1 = require("../../modules/app/Options");
const LexerBuilder_1 = require("../../modules/lexer/LexerBuilder");
const path_1 = require("path");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
/**
 * @author Thiago Delgado Pinto
 */
describe('FeatureSpecAnalyzerTest', () => {
    const analyzer = new FeatureSSA_1.FeatureSSA(); // under test
    let parser = new Parser_1.Parser();
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    let lexer = (new LexerBuilder_1.LexerBuilder()).build(options, 'en');
    beforeEach(() => {
        lexer.reset();
    });
    it('does not critize when it is all right', () => {
        [
            'feature: my feature 1',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc1 = {};
        parser.analyze(lexer.nodes(), doc1);
        lexer.reset();
        [
            'feature: my feature 2',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc2 = {};
        parser.analyze(lexer.nodes(), doc2);
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        spec.docs.push(doc1, doc2);
        const graph = (new SpecFilter_1.SpecFilter(spec)).graph();
        let errors = [];
        analyzer.analyze(graph, spec, errors);
        expect(errors).toHaveLength(0);
    });
    it('critizes duplicated names', () => {
        [
            'feature: my feature 1',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc1 = {};
        parser.analyze(lexer.nodes(), doc1);
        lexer.reset();
        [
            'feature: my feature 1',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc2 = {};
        parser.analyze(lexer.nodes(), doc2);
        let spec = new AugmentedSpec_1.AugmentedSpec('.');
        spec.docs.push(doc1, doc2);
        const graph = (new SpecFilter_1.SpecFilter(spec)).graph();
        let errors = [];
        analyzer.analyze(graph, spec, errors);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/duplicated/ui);
    });
});
