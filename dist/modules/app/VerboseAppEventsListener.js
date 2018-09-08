"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prettyBytes = require("pretty-bytes");
const ErrorSorting_1 = require("../util/ErrorSorting");
const ProcessingInfo_1 = require("./ProcessingInfo");
const TypeChecking_1 = require("../util/TypeChecking");
class VerboseAppEventsListener {
    constructor(_cli, _debug = false) {
        this._cli = _cli;
        this._debug = _debug;
    }
    //
    // FileReadListener
    //
    /** @inheritDoc */
    fileReadStarted(path, size) {
        //this._cli.newLine( ... this._cli.infoArgs( 'Reading', path, ' ', prettyBytes( size ) ) );
    }
    /** @inheritDoc */
    fileReadIgnored(path) {
        this._cli.newLine(this._cli.symbolWarning, 'Ignoring file', this._cli.colorHighlight(path));
    }
    /** @inheritDoc */
    fileReadChunk(path, chunkSize) {
        // empty
    }
    /** @inheritDoc */
    fileReadError(path, error) {
        this._cli.sameLine(this._cli.symbolError, 'Error reading', path, ': ', error.message);
    }
    /** @inheritDoc */
    fileReadFinished(path) {
        // empty
    }
    //
    // DirectoryReadListener
    //
    /** @inheritDoc */
    directoryReadStarted(directory, targets, targetsAreFiles) {
        this._cli.newLine(this._cli.symbolInfo, 'Reading directory', this._cli.colorHighlight(directory));
        this._cli.newLine(this._cli.symbolInfo, 'Looking for', (targets.map(e => this._cli.colorHighlight(e)).join(', ')), targetsAreFiles ? '...' : 'files...');
    }
    /** @inheritDoc */
    directoryReadFinished(data) {
        this._cli.newLine(this._cli.symbolInfo, data.dirCount, 'directories analyzed,', this._cli.colorHighlight(String(data.filesCount)), 'files found,', prettyBytes(data.filesSize), this.formatDuration(data.durationMs));
        if (data.fileErrorCount > 0) {
            const msg2 = this._cli.colorError('Read errors: ') + data.fileErrorCount;
            this._cli.newLine(this._cli.symbolItem, msg2);
        }
    }
    //
    // SingleFileProcessorListener
    //
    /** @inheritDoc */
    processStarted(meta) {
        this._cli.newLine(this._cli.symbolInfo, 'Compiling', this._cli.colorHighlight(meta.fullPath), '...');
    }
    /** @inheritDoc */
    processFinished(data) {
        this.showProcessingInfo(new ProcessingInfo_1.ProcessingInfo(data.durationMs, data.errors, data.warnings), data.meta);
    }
    //
    // MultiFileProcessListener
    //
    /** @inheritDoc */
    multiProcessStarted() {
        this._cli.newLine(this._cli.symbolInfo, 'Invidual compilation started...');
    }
    /** @inheritDoc */
    multiProcessFinished(filesCount, durationMs) {
        if (filesCount < 1) {
            this._cli.newLine(this._cli.symbolInfo, 'No files compiled.');
            return;
        }
        this._cli.newLine(this._cli.symbolInfo, 'Individual compilation finished', this.formatDuration(durationMs));
    }
    //
    // CompilerListener
    //
    /** @inheritDoc */
    compilerStarted(options) {
        // Language
        this._cli.newLine(this._cli.symbolInfo, 'Default language is', this._cli.colorHighlight(options.language));
        // Recursive
        this._cli.newLine(this._cli.symbolInfo, 'Directory recursion', this._cli.colorHighlight(options.recursive ? 'enabled' : 'disabled'));
    }
    /** @inheritDoc */
    semanticAnalysisStarted() {
        // empty
    }
    /** @inheritDoc */
    semanticAnalysisFinished(info) {
        this._cli.newLine(this._cli.symbolInfo, 'Semantic analysis finished', this.formatDuration(info.durationMs));
        this.showProcessingInfo(info);
    }
    //
    // TCGenListener
    //
    /** @inheritDoc */
    testCaseGenerationStarted(warnings) {
        this._cli.newLine(this._cli.symbolInfo, 'Test case generation started');
        this.showErrors(warnings, this._cli.symbolWarning, true);
    }
    /** @inheritDoc */
    testCaseProduced(path, errors, warnings) {
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        const color = this._cli.properColor(hasErrors, hasWarnings);
        const symbol = this._cli.properSymbol(hasErrors, hasWarnings);
        this._cli.newLine(color(symbol), 'Generated test case', this._cli.colorHighlight(path));
        this.showErrors(errors, this._cli.symbolError, true);
        this.showErrors(warnings, this._cli.symbolWarning, true);
    }
    /** @inheritDoc */
    testCaseGenerationFinished(durationMs) {
        this._cli.newLine(this._cli.symbolInfo, 'Test case generation finished', this.formatDuration(durationMs));
    }
    // OTHER
    showProcessingInfo(info, meta) {
        const hasErrors = info.errors.length > 0;
        const hasWarnings = info.warnings.length > 0;
        const color = this._cli.properColor(hasErrors, hasWarnings);
        const symbol = this._cli.properSymbol(hasErrors, hasWarnings);
        if (!hasErrors && !hasWarnings) {
            return;
        }
        const sortedWarnings = ErrorSorting_1.sortErrorsByLocation(info.warnings);
        const sortedErrors = ErrorSorting_1.sortErrorsByLocation(info.errors);
        if (meta) {
            this._cli.newLine(color(symbol), this._cli.colorHighlight(meta.fullPath), 
            //this.formatHash( meta.hash ),
            this.formatDuration(info.durationMs));
        }
        const showSpaces = TypeChecking_1.isDefined(meta);
        this.showErrors(sortedErrors, this._cli.symbolError, showSpaces);
        this.showErrors(sortedWarnings, this._cli.symbolWarning, showSpaces);
    }
    showErrors(errors, symbol, showSpaces) {
        if (errors.length < 1) {
            return;
        }
        const sortedErrors = ErrorSorting_1.sortErrorsByLocation(errors);
        const spaces = ' ';
        for (let e of sortedErrors) {
            let msg = this._debug
                ? e.message + ' ' + this.formattedStackOf(e)
                : e.message;
            if (showSpaces) {
                this._cli.newLine(spaces, symbol, msg);
            }
            else {
                this._cli.newLine(symbol, msg);
            }
        }
    }
    formattedStackOf(err) {
        return "\n  DETAILS: " + err.stack.substring(err.stack.indexOf("\n"));
    }
    // private formatHash( hash: string ): string {
    //     return this._cli.colorInfo( hash.substr( 0, 8 ) );
    // }
    formatDuration(durationMs) {
        return this._cli.colorInfo('(' + durationMs.toString() + 'ms)');
    }
}
exports.VerboseAppEventsListener = VerboseAppEventsListener;
