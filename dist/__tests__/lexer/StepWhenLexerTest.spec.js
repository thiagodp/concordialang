"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const StepWhenLexer_1 = require("../../modules/lexer/StepWhenLexer");
/**
 * @author Thiago Delgado Pinto
 */
describe('StepWhenLexerTest', () => {
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.    
    let words = ['when'];
    let lexer = new StepWhenLexer_1.StepWhenLexer(words);
    it('detects correctly', () => {
        let line = "  \t  \t When \t the world and everybody on it \t";
        let r = lexer.analyze(line, 1);
        expect(r).toBeDefined();
        let node = r.nodes[0];
        // Location
        expect(node.location.line).toBe(1);
        expect(node.location.column).toBe(8);
        // Keyword
        expect(node.nodeType).toBe(NodeTypes_1.NodeTypes.STEP_WHEN);
        // Content
        expect(node.content).toBe('When \t the world and everybody on it');
    });
});
//# sourceMappingURL=StepWhenLexerTest.spec.js.map