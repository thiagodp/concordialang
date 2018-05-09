"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const StepGivenLexer_1 = require("../../modules/lexer/StepGivenLexer");
/**
 * @author Thiago Delgado Pinto
 */
describe('StepGivenLexerTest', () => {
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.    
    let words = ['given'];
    let lexer = new StepGivenLexer_1.StepGivenLexer(words); // under test
    it('detects correctly', () => {
        let line = "  \t  \t Given \t the world and everybody on it \t";
        let r = lexer.analyze(line, 1);
        expect(r).toBeDefined();
        expect(r.nodes).toHaveLength(1);
        let node = r.nodes[0];
        // Location
        expect(node.location.line).toBe(1);
        expect(node.location.column).toBe(8);
        // Keyword
        expect(node.nodeType).toBe(NodeTypes_1.NodeTypes.STEP_GIVEN);
        // Content
        expect(node.content).toBe('Given \t the world and everybody on it');
    });
});
//# sourceMappingURL=StepGivenLexerTest.spec.js.map