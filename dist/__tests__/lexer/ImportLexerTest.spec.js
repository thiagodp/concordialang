"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ImportLexer_1 = require("../../modules/lexer/ImportLexer");
/**
 * @author Thiago Delgado Pinto
 */
describe('ImportLexerTest', () => {
    // IMPORTANT: since ImportLexer inherits from QuotedNodeLexer and does not add any
    // behavior, the QuotedNodeLexerTest already covers most test cases.
    let keyword = 'import';
    let wordInsensitive = 'ImPorT';
    let word = 'import';
    let words = [word];
    let lexer = new ImportLexer_1.ImportLexer(words); // under test
    it('ignores a comment after the value', () => {
        let line = "  \t \t" + word + " \t " + '"Hello world"#comment';
        let r = lexer.analyze(line, 1);
        expect(r).toBeDefined();
        expect(r.errors).toHaveLength(0);
        expect(r.nodes).toHaveLength(1);
        let node = r.nodes[0];
        expect(node).toEqual({
            nodeType: keyword,
            location: { line: 1, column: 6 },
            value: "Hello world"
        });
    });
});
//# sourceMappingURL=ImportLexerTest.spec.js.map