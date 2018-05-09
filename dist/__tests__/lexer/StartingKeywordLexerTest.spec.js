"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StartingKeywordLexer_1 = require("../../modules/lexer/StartingKeywordLexer");
/**
 * @author Thiago Delgado Pinto
 */
describe('StartingKeywordLexerTest', () => {
    let words = ['hello'];
    let keyword = 'hello';
    let lexer = new StartingKeywordLexer_1.StartingKeywordLexer(words, keyword);
    it('detects in a line', () => {
        let line = 'hello world';
        expect(lexer.analyze(line)).not.toBeNull();
    });
    it('detects in a line with spaces and tabs', () => {
        let line = "  \t  \t Hello \t\t world";
        expect(lexer.analyze(line)).not.toBeNull();
    });
    it('ignores a comment', () => {
        let line = 'hello foo bar #comment';
        let r = lexer.analyze(line, 1);
        expect(r).not.toBeNull();
        expect(r.errors).toHaveLength(0);
        expect(r.nodes).toHaveLength(1);
        expect(r.nodes[0].content).toBe('hello foo bar');
    });
    it('gives a warning on empty content', () => {
        let line = 'hello ';
        let r = lexer.analyze(line, 1);
        expect(r).not.toBeNull();
        expect(r.errors).toHaveLength(0);
        expect(r.warnings).toBeDefined();
        expect(r.warnings).toHaveLength(1);
        expect(r.warnings[0].message).toMatch(/(empty)/ui);
    });
    it('gives a warning on empty content, even with a comment', () => {
        let line = 'hello #comment';
        let r = lexer.analyze(line, 1);
        expect(r).not.toBeNull();
        expect(r.errors).toHaveLength(0);
        expect(r.warnings).toBeDefined();
        expect(r.warnings).toHaveLength(1);
        expect(r.warnings[0].message).toMatch(/(empty)/ui);
    });
    it('detects in the correct position', () => {
        let line = "  \t  \t hello \t world and everybody on it \t";
        let r = lexer.analyze(line, 1);
        expect(r).not.toBeNull();
        expect(r.nodes).toHaveLength(1);
        let node = r.nodes[0];
        expect(node.location.line).toBe(1);
        expect(node.location.column).toBe(8);
    });
    it('detects the content correctly', () => {
        let line = '\t hello  \t\t world \t';
        let r = lexer.analyze(line, 1);
        expect(r).not.toBeNull();
        expect(r.nodes).toHaveLength(1);
        let node = r.nodes[0];
        expect(node.content).toBe('hello  \t\t world');
    });
    it('does not detect a line with a different keyword', () => {
        let line = 'Someelse world';
        expect(lexer.analyze(line)).toBeNull();
    });
    it('does not detect without a space after the keyword', () => {
        let line = '\t helloworld \t';
        let r = lexer.analyze(line, 1);
        expect(r).toBeNull();
    });
});
//# sourceMappingURL=StartingKeywordLexerTest.spec.js.map