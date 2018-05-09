"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TextLexer_1 = require("../../modules/lexer/TextLexer");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
/**
 * @author Thiago Delgado Pinto
 */
describe('TextLexerTest', () => {
    let lexer = new TextLexer_1.TextLexer();
    it('does not recognize empty lines', () => {
        expect(lexer.analyze('')).toBeNull();
    });
    it('does not recognize comment lines', () => {
        expect(lexer.analyze('\t #comment')).toBeNull();
    });
    it('detects anything as text', () => {
        let line = "  \t  \t anything here \t";
        let r = lexer.analyze(line, 1);
        expect(r).toBeDefined();
        let node = r.nodes[0];
        // Location
        expect(node.location.line).toBe(1);
        expect(node.location.column).toBe(8);
        // Keyword
        expect(node.nodeType).toBe(NodeTypes_1.NodeTypes.TEXT);
        // Content
        expect(node.content).toBe('  \t  \t anything here \t');
    });
});
//# sourceMappingURL=TextLexerTest.spec.js.map