"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("./SyntacticException");
const TagCollector_1 = require("./TagCollector");
/**
 * TestCase parser
 *
 * @author Thiago Delgado Pinto
 */
class TestCaseParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Has no feature and has no imports?
        if (!context.doc.feature
            && (!context.doc.imports || context.doc.imports.length < 1)) {
            let e = new SyntacticException_1.SyntacticException('A Test Case must be declared after a Feature. Please declare or import a Feature and then declare the Test Case.', node.location);
            errors.push(e);
            return false;
        }
        // Prepares the owner to receive the testCase
        let owner = context.doc;
        if (!owner.testCases) {
            owner.testCases = [];
        }
        // Adds it to the feature
        owner.testCases.push(node);
        // Adjusts the context
        context.resetInValues();
        context.inTestCase = true;
        context.currentTestCase = node;
        // Adds backward tags
        if (!node.tags) {
            node.tags = [];
        }
        (new TagCollector_1.TagCollector()).addBackwardTags(it, node.tags);
        return true;
    }
}
exports.TestCaseParser = TestCaseParser;
