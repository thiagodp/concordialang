"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const Parser_1 = require("../../../modules/parser/Parser");
const ScenarioDA_1 = require("../../../modules/semantic/single/ScenarioDA");
const LexerBuilder_1 = require("../../../modules/lexer/LexerBuilder");
const Options_1 = require("../../../modules/app/Options");
/**
 * @author Thiago Delgado Pinto
 */
describe('ScenarioDATest', () => {
    const analyzer = new ScenarioDA_1.ScenarioDA(); // under test
    let parser = new Parser_1.Parser();
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    let lexer = (new LexerBuilder_1.LexerBuilder()).build(options);
    beforeEach(() => {
        lexer.reset();
    });
    it('does not critize when it is all right', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 2'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc1 = {};
        parser.analyze(lexer.nodes(), doc1);
        let errors = [];
        analyzer.analyze(doc1, errors);
        expect(errors).toHaveLength(0);
    });
    it('critizes duplicated names', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 1'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc1 = {};
        parser.analyze(lexer.nodes(), doc1);
        let errors = [];
        analyzer.analyze(doc1, errors);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/duplicated/ui);
    });
});
