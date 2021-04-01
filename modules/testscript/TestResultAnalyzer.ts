import { AbstractTestScript, ATSTestCase } from 'concordialang-plugin';
import { TestMethodResult, TestScriptExecutionResult } from 'concordialang-types';
import * as deepcopy from 'deepcopy';

/**
 * Test Result Analyzer
 */
export class TestResultAnalyzer {

    adjustResult(
        executionResult: TestScriptExecutionResult,
        abstractTestScripts: AbstractTestScript[]
    ): TestScriptExecutionResult {

        const er = deepcopy( executionResult );

        for ( let r of er.results || [] ) {

            let featureName = r.suite;
            for ( let m of r.methods || [] ) {

                let ats = this.findAbstractTestCase( featureName, m.name, abstractTestScripts );
                if ( ! ats ) {
                    // ERROR
                    // console.log( 'error - not found', featureName, m.name );
                    continue;
                }

                if ( this.shouldAdjustMethodToPassed( ats, m ) ) {

                    m.status = 'adjusted';

                    if ( undefined === er.total.adjusted ) {
                        er.total.adjusted = 1;
                    } else {
                        er.total.adjusted++;
                    }

                    if ( ! isNaN( er.total.failed ) &&
                        er.total.failed > 0 ) {
                        er.total.failed--;
                    }

                    // Notify user!
                    // console.log( 'adjusted to pass', featureName, m.name );
                }
            }
        }

        return er;
    }

    findAbstractTestCase(
        featureName: string,
        testCaseName: string,
        abstractTestScripts: AbstractTestScript[]
    ): ATSTestCase | null {

        const name = testCaseName.indexOf( '|' ) >= 0
            ? testCaseName.split( '|' )[ 1 ].trim()
            : testCaseName;

        for ( let ats of abstractTestScripts || [] ) {
            if ( ats.feature.name !== featureName ) {
                continue;
            }
            for ( let tc of ats.testcases || [] ) {
                if ( tc.name === name ) {
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