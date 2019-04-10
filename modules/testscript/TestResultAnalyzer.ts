import {
    AbstractTestScript,
    ATSTestCase,
    TestMethodResult,
    TestScriptExecutionResult
} from 'concordialang-types';


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
                    // console.log( 'error - not found', featureName, m.name );
                    continue;
                }

                if ( this.shouldAdjustMethodToPassed( ats, m ) ) {

                    m.status = 'adjusted';

                    if ( undefined === executionResult.total.adjusted ) {
                        executionResult.total.adjusted = 1;
                    } else {
                        executionResult.total.adjusted++;
                    }

                    if ( ! isNaN( executionResult.total.failed ) &&
                        executionResult.total.failed > 0 ) {
                        executionResult.total.failed--;
                    }

                    // Notify user!
                    // console.log( 'adjusted to pass', featureName, m.name );
                }
            }
        }
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