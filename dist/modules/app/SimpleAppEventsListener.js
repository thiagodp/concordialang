"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prettyBytes = require("pretty-bytes");
const Defaults_1 = require("./Defaults");
const ErrorSorting_1 = require("../util/ErrorSorting");
const ProcessingInfo_1 = require("./ProcessingInfo");
const TypeChecking_1 = require("../util/TypeChecking");
class SimpleAppEventsListener {
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
        // if ( ! this._verbose ) {
        //     return;
        // }
        // this._cli.newLine( this._cli.symbolSuccess, path );
    }
    //
    // DirectoryReadListener
    //
    /** @inheritDoc */
    directoryReadStarted(directory, targets, targetsAreFiles) {
        this._cli.newLine(this._cli.symbolInfo, 'Reading directory', this._cli.colorHighlight(directory));
        const sameExtensionsAsTheDefaultOnes = JSON.stringify(targets.sort().map(e => e.toLowerCase())) ===
            JSON.stringify((new Defaults_1.Defaults()).EXTENSIONS.sort());
        if (!sameExtensionsAsTheDefaultOnes) {
            this._cli.newLine(this._cli.symbolInfo, 'Looking for', (targets.map(e => this._cli.colorHighlight(e)).join(', ')), targetsAreFiles ? '...' : 'files...');
        }
    }
    /** @inheritDoc */
    directoryReadFinished(data) {
        if (data.fileErrorCount > 0) {
            if (-1 == data.dirCount) {
                this._cli.newLine(this._cli.symbolError, this._cli.colorError('Cannot read the informed directory.'));
                return;
            }
            else {
                this._cli.newLine(this._cli.symbolError, this._cli.colorError('File read errors:'), data.fileErrorCount);
            }
        }
        this._cli.newLine(this._cli.symbolInfo, data.dirCount, 'directories analyzed,', this._cli.colorHighlight(data.filesCount + ' files found,'), prettyBytes(data.filesSize), this.formatDuration(data.durationMs));
    }
    //
    // SingleFileProcessorListener
    //
    /** @inheritDoc */
    processStarted(meta) {
        // nothing
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
        // empty
    }
    /** @inheritDoc */
    multiProcessFinished(filesCount, durationMs) {
        // empty
    }
    //
    // CompilerListener
    //
    /** @inheritDoc */
    compilerStarted(options) {
        // Language
        if (new Defaults_1.Defaults().LANGUAGE !== options.language) {
            this._cli.newLine(this._cli.symbolInfo, 'Default language is', this._cli.colorHighlight(options.language));
        }
        // Recursive
        if (!options.recursive) {
            this._cli.newLine(this._cli.symbolInfo, 'Directory recursion', this._cli.colorHighlight('disabled'));
        }
    }
    /** @inheritDoc */
    semanticAnalysisStarted() {
        // do nothing
    }
    /** @inheritDoc */
    semanticAnalysisFinished(info) {
        this.showProcessingInfo(info);
    }
    //
    // TCGenListener
    //
    /** @inheritDoc */
    testCaseGenerationStarted(warnings) {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation started'
        // );
        this.showErrors(warnings, this._cli.symbolWarning, true);
    }
    /** @inheritDoc */
    testCaseProduced(path, errors, warnings) {
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        const color = this._cli.properColor(hasErrors, hasWarnings);
        const symbol = this._cli.properSymbol(hasErrors, hasWarnings);
        this._cli.newLine(color(symbol), 'Generated', this._cli.colorHighlight(path));
        this.showErrors(errors, this._cli.symbolError, true);
        this.showErrors(warnings, this._cli.symbolWarning, true);
    }
    /** @inheritDoc */
    testCaseGenerationFinished(durationMs) {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation finished',
        //     this.formatDuration( durationMs )
        // );
    }
    // OTHER
    showProcessingInfo(info, meta) {
        const hasErrors = info.errors.length > 0;
        const hasWarnings = info.warnings.length > 0;
        if (!hasErrors && !hasWarnings) {
            return;
        }
        if (meta) {
            const color = this._cli.properColor(hasErrors, hasWarnings);
            const symbol = this._cli.properSymbol(hasErrors, hasWarnings);
            this._cli.newLine(color(symbol), this._cli.colorHighlight(meta.fullPath), 
            //this.formatHash( meta.hash ),
            this.formatDuration(info.durationMs));
        }
        const showSpaces = TypeChecking_1.isDefined(meta);
        this.showErrors(info.errors, this._cli.symbolError, showSpaces);
        this.showErrors(info.warnings, this._cli.symbolWarning, showSpaces);
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
    formatHash(hash) {
        return this._cli.colorInfo(hash.substr(0, 8));
    }
    formatDuration(durationMs) {
        if (durationMs < 0) {
            return '';
        }
        return this._cli.colorInfo('(' + durationMs.toString() + 'ms)');
    }
}
exports.SimpleAppEventsListener = SimpleAppEventsListener;
