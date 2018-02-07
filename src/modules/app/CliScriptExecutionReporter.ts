import { ScriptExecutionReporter } from "./ScriptExecutionReporter";
import { TestScriptExecutionResult } from "../testscript/TestScriptExecution";
import { CLI } from "./CLI";

/**
 * CLI script execution reporter
 * 
 * @author Thiago Delgado Pinto
 */
export class CliScriptExecutionReporter implements ScriptExecutionReporter {

    constructor( private _cli: CLI ) {
    }
    
    report( r: TestScriptExecutionResult ): void {
        let t = r.total;
        if ( ! t.tests ) {
            this._cli.newLine( this._cli.symbolInfo, 'No tests executed.' );
            return;
        }
        const passedStr = t.passed ? this._cli.colorSuccess( t.passed + ' passed' ) : '';
        const failedStr = t.failed ? this._cli.colorWarning( t.failed + ' failed' ) : '';
        const errorStr = t.error ? this._cli.colorError( t.error + ' with error' ) : '';
        const skippedStr = t.skipped ? t.skipped + ' skipped' : '';
        const totalStr = ( t.tests || '0' ) + ' total';

        this._cli.newLine(
            this._cli.symbolInfo,
            'Tests:',
            [ passedStr, failedStr, errorStr, skippedStr, totalStr ].filter( s => s.length > 0 ).join( ', ' ),
            this._cli.colorInfo( '(' + r.durationMs + 'ms)' )
            );

        /*
        // To show only the suite name in green if all the tests passed,
        // all the suite methods if one of them not passed, in their proper colors
        for ( let tsr of r.results ) {
            for ( let m of tsr.methods ) {
                
                this._cli.newLine( tsr.suite );
            }
        }
        */
    }

    cliColorForStatus( status: string ): any {
        switch ( status.toLowerCase() ) {
            case 'passed': return this._cli.colorSuccess;
            case 'failed': return this._cli.colorWarning;
            case 'error': return this._cli.colorError;
            default: return this._cli.colorText;
        }
    }
    
}