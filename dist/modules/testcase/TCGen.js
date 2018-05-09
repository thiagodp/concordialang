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
const NodeTypes_1 = require("../req/NodeTypes");
const ReservedTags_1 = require("../req/ReservedTags");
/**
 * Generates Test Cases from Test Scenarios and parameters.
 *
 * @author Thiago Delgado Pinto
 */
class TCGen {
    constructor(_preTestCaseGenerator) {
        this._preTestCaseGenerator = _preTestCaseGenerator;
    }
    /**
     * Produces TestCases from the given Test Scenario, generation context, and Test Plan Makers.
     *
     * @param ts Test scenario
     * @param ctx Generation context
     * @param testPlanMakers Test plan makers
     */
    generate(ts, ctx, testPlanMakers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (true === ts.ignoreForTestCaseGeneration) {
                return [];
            }
            // console.log( "\n\nScenario steps\n\n", ts.steps.map( s => s.content ) );
            let all = yield this._preTestCaseGenerator.generate(ts.steps, ctx, testPlanMakers);
            let testCases = [];
            for (let preTestCase of all) {
                // console.log( "\n\nPreTestCase\n\n", preTestCase.steps.map( s => s.content ) );
                // console.log( "\n\nOracles\n\n", preTestCase.oracles.map( s => s.content ) );
                let tc = this.produceTestCase(preTestCase);
                // console.log( "\n\nTestCase\n\n", tc.sentences.map( s => s.content ) );
                testCases.push(tc);
            }
            return testCases;
        });
    }
    /**
     * Add reference tags to the given test case.
     *
     * @param tc Test Case
     * @param scenarioIndex Scenario index, starting at 1.
     * @param variantIndex Variant index, staring at 1.
     */
    addReferenceTagsTo(tc, scenarioIndex, variantIndex) {
        tc.declaredScenarioIndex = scenarioIndex;
        tc.declaredVariantIndex = variantIndex;
        if (!tc.tags) {
            tc.tags = [];
        }
        let hasScenarioTag = false, hasVariantTag = false;
        for (let tag of tc.tags) {
            if (ReservedTags_1.ReservedTags.SCENARIO === tag.name)
                hasScenarioTag = true;
            else if (ReservedTags_1.ReservedTags.VARIANT === tag.name)
                hasVariantTag = true;
        }
        if (!hasScenarioTag) {
            tc.tags.push(this.makeTag(ReservedTags_1.ReservedTags.SCENARIO, scenarioIndex));
        }
        if (!hasVariantTag) {
            tc.tags.push(this.makeTag(ReservedTags_1.ReservedTags.VARIANT, variantIndex));
        }
    }
    /**
     * Returns a TestCase produced from a PreTestCase.
     *
     * The TestCase does not have the following attributes:
     * - name
     * - declaredScenarioIndex (not applicable)
     * - declaredVariantIndex (not applicable)
     *
     * The following attributes should be changed later:
     * - location
     *
     * @param preTestCase
     */
    produceTestCase(preTestCase) {
        let tc = {
            nodeType: NodeTypes_1.NodeTypes.TEST_CASE,
            location: { column: 0, line: 0 },
            generated: true,
            notRead: true
        };
        tc.shoudFail = preTestCase.shouldFail();
        tc.tags = this.makeTags(tc);
        // console.log( "\nPRETESTCASE\nsteps", preTestCase.steps.map( s => s.content ) );
        // console.log( "\noracles\n", preTestCase.oracles.map( s => s.content ) );
        if (preTestCase.hasOracles()) {
            tc.sentences = preTestCase.stepsBeforeTheLastThenStep().concat(preTestCase.oracles);
        }
        else {
            tc.sentences = preTestCase.steps.slice(0); // copy array
        }
        return tc;
    }
    /**
     * Make basic tags for the TestCase, according to its flags:
     * - @generated
     * - @fail
     *
     * @param tc Test Case
     */
    makeTags(tc) {
        let tags = [];
        if (tc.generated) {
            tags.push(this.makeTag(ReservedTags_1.ReservedTags.GENERATED));
        }
        if (tc.shoudFail) {
            tags.push(this.makeTag(ReservedTags_1.ReservedTags.SHOULD_FAIL));
        }
        return tags;
    }
    /**
     * Create a Tag
     *
     * @param name
     * @param content
     * @param line
     */
    makeTag(name, content, line = 0) {
        return {
            nodeType: NodeTypes_1.NodeTypes.TAG,
            location: { column: 0, line: line },
            name: name,
            content: content
        };
    }
}
exports.TCGen = TCGen;
//# sourceMappingURL=TCGen.js.map