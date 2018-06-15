import { AbstractTestScript, ATSTestCase } from './AbstractTestScript';
import { TestScriptExecutionResult, TestSuiteResult, TestMethodResult } from "./TestScriptExecution";
import { TestCase } from "../ast/TestCase";

export class TestResultAnalyzer {

    adjustResult(
        executionResult: TestScriptExecutionResult,
        abstractTestScripts: AbstractTestScript[]
    ): void {
        for ( let r of executionResult.results || [] ) {
            let featureName = r.suite;
            for ( let m of r.methods || [] ) {

                let ats = this.findAbstractTestCase( featureName, m.name, abstractTestScripts );
                if ( ! ats ) {
                    // ERROR

                    console.log( 'error - not found', featureName, m.name );

                    continue;
                }

                if ( this.shouldAdjustMethodToPassed( ats, m ) ) {
                    m.status = 'passed';
                    // Notify user!

                    console.log( 'adjusted to pass', featureName, m.name );
                }
            }
        }
    }

    findAbstractTestCase(
        featureName: string,
        testCaseName: string,
        abstractTestScripts: AbstractTestScript[]
    ): ATSTestCase | null {
        for ( let ats of abstractTestScripts || [] ) {
            if ( ats.feature !== featureName ) {
                continue;
            }
            for ( let tc of ats.testcases || [] ) {
                if ( tc.name === testCaseName ) {
                    return tc;
                }
            }
        }
        return null;
    }

    shouldAdjustMethodToPassed( ats: ATSTestCase, methodResult: TestMethodResult ): boolean {
        return 'failed' === methodResult.status && ats.invalid;
    }

}