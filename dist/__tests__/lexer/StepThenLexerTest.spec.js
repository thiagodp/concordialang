"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const StepThenLexer_1 = require("../../modules/lexer/StepThenLexer");
/**
 * @author Thiago Delgado Pinto
 */
describe('StepThenLexerTest', () => {
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.    
    let words = ['then'];
    let lexer = new StepThenLexer_1.StepThenLexer(words); // under test
    it('detects correctly', () => {
        let line = "  \t  \t Then \t the world and everybody on it \t";
        let r = lexer.analyze(line, 1);
        expect(r).toBeDefined();
        let node = r.nodes[0];
        // Location
        expect(node.location.line).toBe(1);
        expect(node.location.column).toBe(8);
        // Keyword
        expect(node.nodeType).toBe(NodeTypes_1.NodeTypes.STEP_THEN);
        // Content
        expect(node.content).toBe('Then \t the world and everybody on it');
    });
});
//# sourceMappingURL=StepThenLexerTest.spec.js.map