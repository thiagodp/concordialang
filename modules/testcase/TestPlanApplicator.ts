import { TestPlan } from "./TestPlan";
import { Step } from "../ast/Step";
import { EntityValueType } from "../ast/UIElement";
import { NodeTypes } from "../req/NodeTypes";
import { Entities } from "../nlp/Entities";
import { NLPUtil } from "../nlp/NLPResult";
import { TestCase } from '../ast/TestCase';
import { DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";

export class TestPlanApplicator {

    /**
     * Transforms UI Elements to UI Literals with value and replace
     * steps' postconditions with the oracles relative to the invalid value.
     *
     * @param testPlan
     * @param steps
     */
    apply( testPlan: TestPlan, steps: Step[] ): TestCase {

        let [ notThenSteps, thenSteps ] = this.separateThenSteps( steps );

        let thenStepsWithoutState = this.extractThenStepsWithoutState( thenSteps );
        const hasStepsWithoutState = thenStepsWithoutState.length > 0;

        let newSteps = notThenSteps.slice( 0 ); // copy array
        let oracleSteps: Step[] = [];

        let valueMap = new Map< string, EntityValueType >(); // values to be reused

        let testCaseShouldFail = false;
        for ( let [ uieName, uieTestPlan ] of testPlan.dataTestCases ) {

            // Generate value


            // Add oracles
            if ( uieTestPlan.result === DTCAnalysisResult.INVALID
                && uieTestPlan.hasOtherwiseSteps() ) {
                oracleSteps.push.apply( oracleSteps, uieTestPlan.otherwiseSteps );
            }

            // Evaluate if should fail
            const shouldFail: boolean = ! hasStepsWithoutState && uieTestPlan.shouldFail();
            if ( shouldFail ) {
                testCaseShouldFail = true;
            }
        }

        const shouldUseNewOracles = oracleSteps.length > 0;

        // Test Case without:
        //   - Name
        //   - Tags
        //   - Reference to Variant
        //   - Reference to Scenario
        //
        let testCase = {
            nodeType: NodeTypes.TEST_CASE,
            generated: true,
            notRead: true,
            shoudFail: testCaseShouldFail,
            stepAfterPreconditions: newSteps[ newSteps.length - 1 ],
            sentences: shouldUseNewOracles ? newSteps.concat( oracleSteps ) : newSteps.concat( thenStepsWithoutState )
        } as TestCase;

        return testCase;
    }

    /**
     * Returns an array containing two arrays:
     *   - the first one is an array with not-Then steps;
     *   - the second one is an array with Then steps.
     *
     * @param steps Steps
     */
    separateThenSteps( steps: Step[] ): [ Step[], Step [] ] {
        let notThenSteps: Step[] = [];
        let thenSteps: Step[] = [];
        let lastThen = null;
        for ( let step of steps || [] ) {
            if ( step.nodeType === NodeTypes.STEP_THEN
                || ( lastThen !== null && step.nodeType === NodeTypes.STEP_AND ) ) {
                lastThen = step;
            } else if ( null === lastThen ) {
                notThenSteps.push( step );
                continue;
            } else {
                lastThen = null;
            }
            thenSteps.push( step );
        }
        return [ notThenSteps, thenSteps ];
    }

    /**
     * Extracts Then steps without state.
     *
     * @param steps Steps
     */
    extractThenStepsWithoutState( steps: Step[] ): Step[] {
        if ( ( steps || [] ).length < 1 ) {
            return [];
        }
        const nlpUtil = new NLPUtil();
        return steps.filter( step => ! nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult ) );
    }

}