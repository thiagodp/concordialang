import { GenUtil, GenContext } from "../testscenario/GenUtil";
import { TestScenario } from "../testscenario/TestScenario";
import { TestCase } from "../ast/TestCase";
import { TestPlanMaker } from "./TestPlanMaker";
import { Pair } from "ts-pair";
import { Step } from "../ast/Step";
import { PreTestCase } from "../testscenario/PreTestCase";
import { TestCaseDocumentGenerator } from "./TestCaseDocumentGenerator";
import { NodeTypes } from "../req/NodeTypes";
import { Tag } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";

/**
 * Generates Test Cases from Test Scenarios and parameters.
 *
 * @author Thiago Delgado Pinto
 */
export class TCGen {

    constructor(
        private _genUtil: GenUtil
    ) {
    }

    /**
     * Produces TestCases from the given Test Scenario, generation context, and Test Plan Makers.
     *
     * @param ts Test scenario
     * @param ctx Generation context
     * @param testPlanMakers Test plan makers
     */
    generate( ts: TestScenario, ctx: GenContext, testPlanMakers: TestPlanMaker[] ): TestCase[] {

        if ( ts.ignoreForTestCaseGeneration ) {
            return [];
        }

        let all: PreTestCase[] = this._genUtil.generate( ts.steps, ctx, testPlanMakers );

        let testCases: TestCase[] = [];
        for ( let preTestCase of all ) {
            testCases.push( this.produceTestCase( preTestCase ) );
        }
        return testCases;
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
    produceTestCase( preTestCase: PreTestCase ): TestCase {

        let tc: TestCase = {
            nodeType: NodeTypes.TEST_CASE,
            location: { column: 0, line: 0 },
            generated: true,
            notRead: true
        } as TestCase;

        tc.shoudFail = preTestCase.shouldFail();

        tc.tags = this.makeTags( tc );

        if ( preTestCase.hasOracles() ) {
            tc.sentences = preTestCase.stepsBeforeTheFirstThenStep().concat( preTestCase.oracles );
        } else {
            tc.sentences = preTestCase.steps.slice( 0 ); // copy array
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
    makeTags( tc: TestCase ): Tag[] {
        let tags: Tag[] = [];

        if ( tc.generated ) {
            tags.push(
                {
                    nodeType: NodeTypes.TAG,
                    location: { column: 0, line: 0 },
                    name: ReservedTags.GENERATED
                } as Tag
            );
        }

        if ( tc.shoudFail ) {
            tags.push(
                {
                    nodeType: NodeTypes.TAG,
                    location: { column: 0, line: 0 },
                    name: ReservedTags.SHOULD_FAIL
                } as Tag
            );
        }

        return tags;
    }

}