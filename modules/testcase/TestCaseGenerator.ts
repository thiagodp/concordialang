import { ReservedTags, Tag, TestCase } from "../ast";
import { NodeTypes } from "../req/NodeTypes";
import { PreTestCase } from "../testscenario/PreTestCase";
import { GenContext, PreTestCaseGenerator } from "../testscenario/PreTestCaseGenerator";
import { TestScenario } from "../testscenario/TestScenario";
import { TestPlanner } from "./TestPlanner";

/**
 * Generates Test Cases from Test Scenarios and parameters.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseGenerator {

    constructor(
        private _preTestCaseGenerator: PreTestCaseGenerator
    ) {
    }

    /**
     * Produces TestCases from the given Test Scenario, generation context, and Test Plan Makers.
     *
     * @param ts Test scenario
     * @param ctx Generation context
     * @param testPlanMakers Test plan makers
     */
    async generate( ts: TestScenario, ctx: GenContext, testPlanMakers: TestPlanner[] ): Promise< TestCase[] > {

        if ( true === ts.ignoreForTestCaseGeneration ) {
            return [];
        }

        // console.log( "\n\nScenario steps\n\n", ts.steps.map( s => s.content ) );
        let all: PreTestCase[] = await this._preTestCaseGenerator.generate( ts.steps, ctx, testPlanMakers );

        let testCases: TestCase[] = [];
        for ( let preTestCase of all ) {
            // console.log( "\n\nPreTestCase\n\n", preTestCase.steps.map( s => s.content ) );
            // console.log( "\n\nOracles\n\n", preTestCase.oracles.map( s => s.content ) );
            let tc = this.produceTestCase( preTestCase );
            // console.log( "\n\nTestCase\n\n", tc.sentences.map( s => s.content ) );
            testCases.push( tc );
        }
        return testCases;
    }

    /**
     * Add reference tags to the given test case.
     *
     * @param tc Test Case
     * @param scenarioIndex Scenario index, starting at 1.
     * @param variantIndex Variant index, staring at 1.
     */
    addReferenceTagsTo( tc: TestCase, scenarioIndex: number, variantIndex: number ): void {

        tc.declaredScenarioIndex = scenarioIndex;
        tc.declaredVariantIndex = variantIndex;

        if ( ! tc.tags ) {
            tc.tags = [];
        }

        let hasScenarioTag = false, hasVariantTag = false;
        for ( let tag of tc.tags ) {
            if ( ReservedTags.SCENARIO === tag.name ) hasScenarioTag = true;
            else if ( ReservedTags.VARIANT === tag.name ) hasVariantTag = true;
        }

        if ( ! hasScenarioTag ) {
            tc.tags.push( this.makeTag( ReservedTags.SCENARIO, scenarioIndex ) );
        }

        if ( ! hasVariantTag ) {
            tc.tags.push( this.makeTag( ReservedTags.VARIANT, variantIndex ) );
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
    private produceTestCase( preTestCase: PreTestCase ): TestCase {

        let tc: TestCase = {
            nodeType: NodeTypes.TEST_CASE,
            location: { column: 0, line: 0 },
            generated: true,
            notRead: true
        } as TestCase;

        tc.shouldFail = preTestCase.shouldFail();

        tc.tags = this.makeTags( tc );

        // console.log( "\nPRETESTCASE\nsteps", preTestCase.steps.map( s => s.content ) );
        // console.log( "\noracles\n", preTestCase.oracles.map( s => s.content ) );

        if ( preTestCase.hasOracles() ) {
            tc.sentences = preTestCase.stepsBeforeTheLastThenStep().concat( preTestCase.oracles );
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
    private makeTags( tc: TestCase ): Tag[] {
        let tags: Tag[] = [];

        if ( tc.generated ) {
            tags.push( this.makeTag( ReservedTags.GENERATED ) );
        }

        if ( tc.shouldFail ) {
            tags.push( this.makeTag( ReservedTags.FAIL ) );
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
    private makeTag( name: string, content?: string | number, line: number = 0 ): Tag {
        return {
            nodeType: NodeTypes.TAG,
            location: { column: 0, line: line },
            name: name,
            content: content
        } as Tag
    }

}