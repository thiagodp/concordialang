"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliScriptExecutionReporter = void 0;
const TimeFormat_1 = require("../util/TimeFormat");
/**
 * CLI script execution reporter
 *
 * @author Thiago Delgado Pinto
 */
class CliScriptExecutionReporter {
    constructor(_cli) {
        this._cli = _cli;
    }
    /** @inheritDoc */
    scriptExecuted(r) {
        const LINE_SIZE = 80;
        const SEPARATION_LINE = '_'.repeat(LINE_SIZE);
        this._cli.newLine(SEPARATION_LINE);
        let t = r.total;
        if (!t.tests) {
            this._cli.newLine(this._cli.symbolInfo, 'No tests executed.');
            return;
        }
        this._cli.newLine(this._cli.symbolInfo, 'Test execution results:', "\n");
        const passedStr = t.passed ? this._cli.bgSuccess(t.passed + ' passed') : '';
        const failedStr = t.failed ? this._cli.bgWarning(t.failed + ' failed') : '';
        const adjustedStr = t.adjusted ? this._cli.colors.bgCyan(t.adjusted + ' adjusted') : '';
        const errorStr = t.error ? this._cli.bgError(t.error + ' with error') : '';
        const skippedStr = t.skipped ? t.skipped + ' skipped' : '';
        const totalStr = (t.tests || '0') + ' total';
        this._cli.newLine('  ', [passedStr, adjustedStr, failedStr, errorStr, skippedStr, totalStr].filter(s => s.length > 0).join(', '), this._cli.colorInfo('in ' + TimeFormat_1.millisToString(r.durationMs, null, ' ')), "\n");
        if (0 == t.failed && 0 == t.error) {
            return;
        }
        const msgReason = this._cli.colorInfo('       reason:');
        const msgScript = this._cli.colorInfo('       script:');
        const msgDuration = this._cli.colorInfo('     duration:');
        const msgTestCase = this._cli.colorInfo('    test case:');
        for (let tsr of r.results) {
            for (let m of tsr.methods) {
                let e = m.exception;
                if (!e) {
                    continue;
                }
                let color = this.cliColorForStatus(m.status);
                let sLoc = e.scriptLocation;
                let tcLoc = e.specLocation;
                this._cli.newLine('  ', this._cli.figures.line, ' '.repeat(9 - m.status.length) + color(m.status + ':'), this._cli.colorHighlight(tsr.suite), this._cli.figures.pointerSmall, this._cli.colorHighlight(m.name), "\n", msgReason, e.message, "\n", msgScript, this._cli.colorHighlight(sLoc.filePath), '(' + sLoc.line + ',' + sLoc.column + ')', "\n", msgDuration, this._cli.colorInfo(m.durationMs + 'ms'), "\n", msgTestCase, this._cli.colorInfo(tcLoc.filePath, '(' + tcLoc.line + ',' + tcLoc.column + ')'), "\n");
            }
        }
    }
    cliColorForStatus(status) {
        switch (status.toLowerCase()) {
            case 'passed': return this._cli.colorSuccess;
            case 'adjusted': return this._cli.colors.cyanBright;
            case 'failed': return this._cli.colorWarning;
            case 'error': return this._cli.colorError;
            default: return this._cli.colorText;
        }
    }
}
exports.CliScriptExecutionReporter = CliScriptExecutionReporter;
