"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ora = require("ora");
const path_1 = require("path");
const sprintf_js_1 = require("sprintf-js");
const terminalLink = require("terminal-link");
const Defaults_1 = require("../app/Defaults");
const ErrorSorting_1 = require("../error/ErrorSorting");
const TimeFormat_1 = require("../util/TimeFormat");
class SimpleAppUI {
    constructor(_cli, _meow, _debugMode = false) {
        this._cli = _cli;
        this._meow = _meow;
        this._debugMode = _debugMode;
        this._spinner = ora();
    }
    //
    // AppUI
    //
    /** @inheritdoc */
    setDebugMode(debugMode) {
        this._debugMode = debugMode;
    }
    /** @inheritdoc */
    showHelp() {
        this._cli.newLine(this._meow.help);
    }
    /** @inheritdoc */
    showAbout() {
        const m = this._meow;
        const desc = m.pkg.description || 'Concordia';
        const version = m.pkg.version || '1.0.0';
        const name = m.pkg.author.name || 'Thiago Delgado Pinto';
        const site = m.pkg.homepage || 'http://concordialang.org';
        this._cli.newLine(desc + ' v' + version);
        this._cli.newLine('Copyright (c) ' + name);
        this._cli.newLine(site);
    }
    /** @inheritdoc */
    showVersion() {
        this._meow.showVersion();
    }
    /** @inheritdoc */
    announceOptions(options) {
        if (!options) {
            return;
        }
        // Language
        if (new Defaults_1.Defaults().LANGUAGE !== options.language) {
            this.info('Default language is', this._cli.colorHighlight(options.language));
        }
        const disabledStr = this._cli.colorHighlight('disabled');
        // Recursive
        if (!options.recursive) {
            this.info('Directory recursion', disabledStr);
        }
        if (!options.compileSpecification) {
            this.info('Specification compilation', disabledStr);
        }
        else {
            if (!options.generateTestCase) {
                this.info('Test Case generation', disabledStr);
            }
        }
        if (!options.generateScript) {
            this.info('Test script generation disabled', disabledStr);
        }
        if (!options.executeScript) {
            this.info('Test script execution', disabledStr);
        }
        if (!options.analyzeResult) {
            this.info('Test script results\' analysis', disabledStr);
        }
        if (!options.compileSpecification
            && !options.generateTestCase
            && !options.generateScript
            && !options.executeScript
            && !options.analyzeResult) {
            this.warn('Well, you have disabled all the interesting behavior. :)');
        }
    }
    /** @inheritdoc */
    announceUpdateAvailable(url, hasBreakingChange) {
        // When the terminal does not support links
        const fallback = (text, url) => {
            return url;
        };
        const link = terminalLink(url, url, { fallback: fallback }); // clickable URL
        if (hasBreakingChange) {
            this.show(this._cli.colorHighlight('→'), this._cli.bgHighlight('PLEASE READ THE RELEASE NOTES BEFORE UPDATING'));
            this.show(this._cli.colorHighlight('→'), link);
        }
        else {
            this.show(this._cli.colorHighlight('→'), 'See', link, 'for details.');
        }
    }
    /** @inheritdoc */
    announceNoUpdateAvailable() {
        this.info('No updates available.');
    }
    /** @inheritdoc */
    announceConfigurationFileAlreadyExists() {
        this.warn('You already have a configuration file.');
    }
    /** @inheritDoc */
    announcePluginNotFound(pluginDir, pluginName) {
        this.error(`Plugin "${pluginName}" not found at "${pluginDir}".`);
    }
    /** @inheritDoc */
    announcePluginCouldNotBeLoaded(pluginName) {
        this.error(`Could not load the plugin: ${pluginName}.`);
    }
    /** @inheritDoc */
    announceNoPluginWasDefined() {
        this.warn('A plugin was not defined.');
    }
    /** @inheritDoc */
    announceReportFileNotFound(filePath) {
        this.warn(`Could not retrieve execution results from "${filePath}".`);
    }
    /** @inheritdoc */
    drawLanguages(languages) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolInfo, 'Available languages:', languages.sort().map(l => highlight(l)).join(', '));
    }
    /** @inheritdoc */
    showErrorSavingAST(astFile, errorMessage) {
        this.error('Error saving', this._cli.colorHighlight(astFile), ': ' + errorMessage);
    }
    /** @inheritdoc */
    announceASTIsSaved(astFile) {
        this.info('Saved', this._cli.colorHighlight(astFile));
    }
    /** @inheritdoc */
    showGeneratedTestScriptFiles(scriptDir, files) {
        // When the terminal does not support links
        const fallback = (text, url) => {
            return text;
        };
        for (const file of files) {
            const relPath = path_1.relative(scriptDir, file);
            const link = terminalLink(relPath, file, { fallback: fallback }); // clickable URL
            this.success('Generated script', this._cli.colorHighlight(link));
        }
    }
    /** @inheritdoc */
    showTestScriptGenerationErrors(errors) {
        for (const err of errors) {
            this.exception(err);
        }
    }
    /** @inheritdoc */
    show(...args) {
        this._cli.newLine(...args);
    }
    /** @inheritdoc */
    success(...args) {
        this._cli.newLine(this._cli.symbolSuccess, ...args);
    }
    /** @inheritdoc */
    info(...args) {
        this._cli.newLine(this._cli.symbolInfo, ...args);
    }
    /** @inheritdoc */
    warn(...args) {
        this._cli.newLine(this._cli.symbolWarning, ...args);
    }
    /** @inheritdoc */
    error(...args) {
        this._cli.newLine(this._cli.symbolError, ...args);
    }
    /** @inheritdoc */
    exception(error) {
        if (this._debugMode) {
            this.error(error.message, this.formattedStackOf(error));
        }
        else {
            this.error(error.message);
        }
    }
    // /** @inheritDoc */
    // fileReadError( path: string, error: Error ): void {
    //     this._cli.sameLine( this._cli.symbolError, 'Error reading', path, ': ', error.message );
    // }
    // /** @inheritDoc */
    // directoryReadStarted( directory: string, targets: string[], targetsAreFiles: boolean ): void {
    //     this._cli.newLine( this._cli.symbolInfo, 'Reading directory',
    //         this._cli.colorHighlight( directory ) );
    //     const sameExtensionsAsTheDefaultOnes: boolean =
    //         JSON.stringify( targets.sort().map( e => e.toLowerCase() ) ) ===
    //         JSON.stringify( ( new Defaults() ).EXTENSIONS.sort() );
    //     if ( ! sameExtensionsAsTheDefaultOnes ) {
    //         this._cli.newLine(
    //             this._cli.symbolInfo,
    //             'Looking for',
    //             ( targets.map( e => this._cli.colorHighlight( e ) ).join( ', ' ) ),
    //             targetsAreFiles ? '...' : 'files...'
    //         );
    //     }
    // }
    // /** @inheritDoc */
    // directoryReadFinished( data: DirectoryReadResult ): void {
    //     if ( data.fileErrorCount > 0 ) {
    //         if ( -1 == data.dirCount ) {
    //             this._cli.newLine(
    //                 this._cli.symbolError,
    //                 this._cli.colorError( 'Cannot read the informed directory.' )
    //             );
    //             return;
    //         } else {
    //             this._cli.newLine(
    //                 this._cli.symbolError,
    //                 this._cli.colorError( 'File read errors:' ),
    //                 data.fileErrorCount
    //             );
    //         }
    //     }
    //     this._cli.newLine( this._cli.symbolInfo,
    //         data.dirCount, 'directories analyzed,',
    //         this._cli.colorHighlight( data.filesCount + ' files found,' ),
    //         prettyBytes( data.filesSize ),
    //         this.formatDuration( data.durationMs )
    //         );
    // }
    //
    // OptionsListener
    //
    /** @inheritDoc */
    announceConfigurationFileSaved(filePath) {
        this.info('Saved', this._cli.colorHighlight(filePath));
    }
    /** @inheritDoc */
    announceCouldNotLoadConfigurationFile(errorMessage) {
        this.warn('Could not load the configuration file:', errorMessage);
    }
    /** @inheritDoc */
    announceConfigurationFileLoaded(filePath) {
        this.info('Configuration file loaded:', this._cli.colorHighlight(filePath));
    }
    /** @inheritDoc */
    announceSeed(seed, generatedSeed) {
        this.info(generatedSeed ? 'Generated seed' : 'Seed', this._cli.colorHighlight(seed));
    }
    /** @inheritDoc */
    announceRealSeed(realSeed) {
        if (this._debugMode) {
            this.info('Real seed', this._cli.colorHighlight(realSeed));
        }
    }
    //
    // FileCompilationListener
    //
    /** @inheritDoc */
    fileStarted(path) {
        // nothing
    }
    /** @inheritDoc */
    fileFinished(path, durationMS) {
        // nothing
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
        this.showErrors(warnings, true);
    }
    /** @inheritDoc */
    testCaseProduced(path, errors, warnings) {
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        if (!hasErrors && !hasWarnings) {
            return;
        }
        const color = this._cli.properColor(hasErrors, hasWarnings);
        const symbol = this._cli.properSymbol(hasErrors, hasWarnings);
        this._cli.newLine(color(symbol), 'Generated', this._cli.colorHighlight(path));
        this.showErrors([...errors, ...warnings], true);
    }
    /** @inheritDoc */
    testCaseGenerationFinished(durationMs) {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation finished',
        //     this.formatDuration( durationMs )
        // );
    }
    //
    // CompilerListener
    //
    /** @inheritDoc */
    compilerStarted(options) {
        this._spinner.start();
    }
    /** @inheritdoc */
    compilationFinished(durationMS) {
        this._spinner.stop();
        this.info('Compiled', this.formatDuration(durationMS));
    }
    /** @inheritdoc */
    reportProblems(problems, basePath) {
        // GENERIC
        const genericErrors = problems.getGenericErrors();
        const genericWarnings = problems.getGenericWarnings();
        this.showErrors([...genericErrors, ...genericWarnings], false);
        // PER FILE
        // When the terminal does not support links
        const fallback = (text, url) => {
            return text;
        };
        const nonGeneric = problems.nonGeneric();
        for (const [filePath, problemInfo] of nonGeneric) {
            const hasErrors = problemInfo.hasErrors();
            const hasWarnings = problemInfo.hasWarnings();
            if (!hasErrors && !hasWarnings) {
                return;
            }
            const color = this._cli.properColor(hasErrors, hasWarnings);
            const symbol = this._cli.properSymbol(hasErrors, hasWarnings);
            const text = path_1.relative(basePath, filePath);
            const link = terminalLink(text, filePath, { fallback: fallback }); // clickable URL
            this._cli.newLine(color(symbol), this._cli.colorHighlight(link));
            this.showErrors([...problemInfo.errors, ...problemInfo.warnings], true);
        }
    }
    //
    // PluginListener
    //
    /** @inheritdoc */
    drawPluginList(plugins) {
        if (plugins.length < 1) {
            this._cli.newLine(this._cli.symbolInfo, 'No plugins found. Try to install a plugin with NPM.');
            return;
        }
        // const highlight = this._cli.colorHighlight;
        // const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        // this._cli.newLine( highlight( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        // for ( let p of plugins ) {
        //     this._cli.newLine( sprintf( format, p.name, p.version, p.description ) );
        // }
        const highlight = this._cli.colorHighlight;
        const format = "%-15s";
        this._cli.newLine(this._cli.symbolInfo, highlight('Available Plugins:'));
        for (let p of plugins) {
            this._cli.newLine(' ');
            this._cli.newLine(highlight(sprintf_js_1.sprintf(format, '  Name')), p.name);
            this._cli.newLine(highlight(sprintf_js_1.sprintf(format, '  Version')), p.version);
            this._cli.newLine(highlight(sprintf_js_1.sprintf(format, '  Description')), p.description);
        }
    }
    /** @inheritdoc */
    drawSinglePlugin(p) {
        const highlight = this._cli.colorHighlight;
        const format = "  - %-12s: %s"; // util.format does not support padding :(
        const authors = p.authors.map((a, idx) => 0 === idx ? a : sprintf_js_1.sprintf('%-17s %s', '', a));
        this._cli.newLine(this._cli.symbolInfo, sprintf_js_1.sprintf('Plugin %s', highlight(p.name)));
        this._cli.newLine(sprintf_js_1.sprintf(format, 'version', p.version));
        this._cli.newLine(sprintf_js_1.sprintf(format, 'description', p.description));
        this._cli.newLine(sprintf_js_1.sprintf(format, 'targets', p.targets.join(', ')));
        this._cli.newLine(sprintf_js_1.sprintf(format, 'authors', authors.join('\n')));
        if (p.isFake) {
            this._cli.newLine(sprintf_js_1.sprintf(format, 'fake', p.isFake ? 'yes' : 'no'));
        }
        this._cli.newLine(sprintf_js_1.sprintf(format, 'file', p.file));
        this._cli.newLine(sprintf_js_1.sprintf(format, 'class', p.class));
    }
    /** @inheritdoc */
    showMessagePluginNotFound(name) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolError, sprintf_js_1.sprintf('No plugins installed with the name "%s".', highlight(name)));
    }
    /** @inheritdoc */
    showMessagePluginAlreadyInstalled(name) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolInfo, sprintf_js_1.sprintf('The plugin %s is already installed.', highlight(name)));
    }
    /** @inheritdoc */
    showMessageTryingToInstall(name, tool) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolInfo, sprintf_js_1.sprintf('Trying to install %s with %s.', highlight(name), tool));
    }
    /** @inheritdoc */
    showMessageTryingToUninstall(name, tool) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolInfo, sprintf_js_1.sprintf('Trying to uninstall %s with %s.', highlight(name), tool));
    }
    /** @inheritdoc */
    showMessageCouldNoFindInstalledPlugin(name) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolInfo, sprintf_js_1.sprintf('Could not find installed plug-in %s. Please try again.', highlight(name)));
    }
    /** @inheritdoc */
    showMessagePackageFileNotFound(file) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolWarning, sprintf_js_1.sprintf('Could not find %s. I will create it for you.', highlight(file)));
    }
    /** @inheritdoc */
    showPluginServeStart(name) {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(this._cli.symbolInfo, sprintf_js_1.sprintf('Serving %s...', highlight(name)));
    }
    /** @inheritdoc */
    showCommandStarted(command) {
        this._cli.newLine('  Running', this._cli.colorHighlight(command));
        this.drawSeparationLine();
    }
    /** @inheritdoc */
    showCommandFinished() {
        this.drawSeparationLine();
    }
    drawSeparationLine() {
        const separationLine = '  ' + '_'.repeat(78);
        this._cli.newLine(separationLine);
    }
    /** @inheritdoc */
    showCommandCode(code, showIfSuccess = true) {
        if (0 === code) {
            if (showIfSuccess) {
                this._cli.newLine(this._cli.symbolSuccess, 'Success');
            }
        }
        else {
            this._cli.newLine(this._cli.symbolError, 'Error during command execution.');
        }
    }
    /** @inheritdoc */
    showError(e) {
        this._cli.newLine(this._cli.symbolError, e.message);
    }
    //
    // ScriptExecutionListener
    //
    showSeparationLine() {
        const LINE_SIZE = 80;
        const SEPARATION_LINE = '_'.repeat(LINE_SIZE);
        this._cli.newLine(SEPARATION_LINE);
    }
    /** @inheritDoc */
    testScriptExecutionStarted() {
        this._cli.newLine(this._cli.symbolInfo, 'Executing test scripts...');
        this.showSeparationLine();
    }
    /** @inheritDoc */
    testScriptExecutionDisabled() {
        this._cli.newLine(this._cli.symbolInfo, 'Script execution disabled.');
    }
    /** @inheritDoc */
    testScriptExecutionError(error) {
        this.exception(error);
        this.showSeparationLine();
    }
    /** @inheritDoc */
    testScriptExecutionFinished(r) {
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
    //
    // OTHER
    //
    cliColorForStatus(status) {
        switch (status.toLowerCase()) {
            case 'passed': return this._cli.colorSuccess;
            case 'adjusted': return this._cli.colors.cyanBright;
            case 'failed': return this._cli.colorWarning;
            case 'error': return this._cli.colorError;
            default: return this._cli.colorText;
        }
    }
    showErrors(errors, showSpaces) {
        if (!errors || errors.length < 1) {
            return;
        }
        const sortedErrors = ErrorSorting_1.sortErrorsByLocation(errors);
        const spaces = ' ';
        for (let e of sortedErrors) {
            const symbol = e.isWarning ? this._cli.symbolWarning : this._cli.symbolError;
            let msg = this._debugMode
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
        if (durationMs < 0) {
            return '';
        }
        return this._cli.colorInfo('(' + durationMs.toString() + 'ms)');
    }
}
exports.SimpleAppUI = SimpleAppUI;
