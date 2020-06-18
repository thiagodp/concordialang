"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
const figures = require("figures");
const logSymbols = require("log-symbols");
const path_1 = require("path");
const readline = require("readline");
const sprintf_js_1 = require("sprintf-js");
const terminalLink = require("terminal-link");
const Defaults_1 = require("../app/Defaults");
const ErrorSorting_1 = require("../error/ErrorSorting");
const TimeFormat_1 = require("../util/TimeFormat");
exports.pluralS = (count, singular, plural) => {
    return 1 === count ? singular : (plural || (singular + 's'));
};
class SimpleUI {
    // Ora has a bug that swallows lines before stop that spinner and that's why it was removed.
    // @see https://github.com/sindresorhus/ora/issues/90
    // Note: Same problem using "elegant-spinner" with "log-update"
    //
    // protected _spinner = ora();
    constructor(_meow, _debugMode = false) {
        this._meow = _meow;
        this._debugMode = _debugMode;
        // CLI ---------------------------------------------------------------------
        // SYMBOLS
        this.symbolPointer = figures.pointerSmall;
        this.symbolItem = figures.line;
        this.symbolSuccess = logSymbols.success;
        this.symbolError = logSymbols.error;
        this.symbolWarning = logSymbols.warning;
        this.symbolInfo = logSymbols.info;
        // COLORS
        this.colorSuccess = colors.greenBright.bind(colors); // chalk.rgb(0, 255, 0);
        this.colorError = colors.redBright.bind(colors); // colors.rgb(255, 0, 0);
        this.colorCriticalError = colors.rgb(139, 0, 0); // dark red
        this.colorWarning = colors.yellow.bind(colors);
        this.colorDiscreet = colors.gray.bind(colors);
        this.highlight = colors.yellowBright.bind(colors); // colors.rgb(255, 242, 0);
        this.colorText = colors.white.bind(colors);
        this.colorCyanBright = colors.cyanBright.bind(colors);
        this.colorMagenta = colors.magentaBright.bind(colors);
        this.bgSuccess = colors.bgGreenBright.bind(colors);
        this.bgError = colors.bgRed.bind(colors);
        this.bgCriticalError = colors.bgRgb(139, 0, 0).bind(colors); // dark red
        this.bgWarning = colors.bgYellow.bind(colors);
        this.bgInfo = colors.bgBlackBright.bind(colors); // bgGray does not exist in colors
        this.bgHighlight = colors.bgYellowBright.bind(colors);
        this.bgText = colors.bgWhiteBright.bind(colors);
        this.bgCyan = colors.bgCyan.bind(colors);
    }
    // protected intervalFn = null;
    // protected startSpinner(): void {
    //     // Ora has a bug that swallows lines before stop that spinner and that's why it was removed.
    //     // @see https://github.com/sindresorhus/ora/issues/90
    //     // Note: Same problem using "elegant-spinner" with "log-update"
    //     //
    //     // this._spinner.start();
    // }
    // protected stopSpinner( symbolWhenStop?: string ): void {
    //     // Ora has a bug that swallows lines before stop that spinner and that's why it was removed.
    //     // @see https://github.com/sindresorhus/ora/issues/90
    //     // Note: Same problem using "elegant-spinner" with "log-update"
    //     //
    //     // const symbol = symbolWhenStop || this.colorInfo( this.symbolInfo );
    //     // this._spinner.stopAndPersist( { symbol: symbol } );
    //     // this._spinner.stop();
    // }
    clearLine() {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
    }
    write(...args) {
        process.stdout.write(args.join(' '));
    }
    writeln(...args) {
        // console.log( ... args ); // weird, swallowing some lines sometimes...
        process.stdout.write(args.join(' ') + '\n');
    }
    properColor(hasErrors, hasWarnings) {
        if (hasErrors) {
            return this.colorError;
        }
        if (hasWarnings) {
            return this.colorWarning;
        }
        return this.colorSuccess;
    }
    properBg(hasErrors, hasWarnings) {
        if (hasErrors) {
            return this.bgError;
        }
        if (hasWarnings) {
            return this.bgWarning;
        }
        return this.bgSuccess;
    }
    properSymbol(hasErrors, hasWarnings) {
        if (hasErrors) {
            return this.symbolError;
        }
        if (hasWarnings) {
            return this.symbolWarning;
        }
        return this.symbolSuccess;
    }
    // -------------------------------------------------------------------------
    //
    // AppUI
    //
    /** @inheritdoc */
    setDebugMode(debugMode) {
        this._debugMode = debugMode;
    }
    /** @inheritdoc */
    showHelp() {
        this.writeln(this._meow.help);
    }
    /** @inheritdoc */
    showAbout() {
        const m = this._meow;
        const desc = m.pkg.description || 'Concordia';
        const version = m.pkg.version || '1.0.0';
        const name = m.pkg.author.name || 'Thiago Delgado Pinto';
        const site = m.pkg.homepage || 'http://concordialang.org';
        this.writeln(desc + ' v' + version);
        this.writeln('Copyright (c) ' + name);
        this.writeln(site);
    }
    /** @inheritdoc */
    showVersion() {
        this._meow.showVersion();
    }
    /** @inheritdoc */
    announceOptions(options) {
        // Language
        if (new Defaults_1.Defaults().LANGUAGE !== options.language) {
            this.info('Default language is', this.highlight(options.language));
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
            this.writeln(this.highlight('→'), this.bgHighlight('PLEASE READ THE RELEASE NOTES BEFORE UPDATING'));
            this.writeln(this.highlight('→'), link);
        }
        else {
            this.writeln(this.highlight('→'), 'See', link, 'for details.');
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
        const highlight = this.highlight;
        this.info('Available languages:', languages.sort().map(l => highlight(l)).join(', '));
    }
    // Database
    /** @inheritdoc */
    announceDatabasePackagesInstallationStarted(singular = false) {
        this.info(this.colorCyanBright('Installing database driver' + (singular ? '' : 's') + '...'));
        this.drawSeparationLine();
    }
    announceDatabasePackagesUninstallationStarted(singular = false) {
        this.info(this.colorCyanBright('Uninstalling database driver' + (singular ? '' : 's') + '...'));
        this.drawSeparationLine();
    }
    /** @inheritdoc */
    announceDatabasePackage(packageName) {
        this.write(' ', this.highlight(packageName), "\n");
    }
    /** @inheritdoc */
    announceDatabasePackagesInstallationFinished(code) {
        this.drawSeparationLine();
        if (0 == code) {
            this.info(this.colorCyanBright('Installation successful.'));
        }
        else {
            this.warn(this.colorCyanBright('A problem occurred during installation.'));
        }
    }
    /** @inheritdoc */
    announceDatabasePackagesUninstallationFinished(code) {
        this.drawSeparationLine();
        if (0 == code) {
            this.info(this.colorCyanBright('Uninstallation successful.'));
        }
        else {
            this.warn(this.colorCyanBright('A problem occurred during uninstallation.'));
        }
    }
    drawDatabases(databases) {
        if (!databases || databases.length < 1) {
            this.info('No database drivers installed.');
            return;
        }
        const dbs = databases.map(d => this.highlight(d));
        this.info('Installed database drivers:', dbs.join(', '));
    }
    /** @inheritdoc */
    showErrorSavingAbstractSyntaxTree(astFile, errorMessage) {
        this.error('Error saving', this.highlight(astFile), ': ' + errorMessage);
    }
    /** @inheritdoc */
    announceAbstractSyntaxTreeIsSaved(astFile) {
        this.info('Saved', this.highlight(astFile));
    }
    /** @inheritdoc */
    showGeneratedTestScriptFiles(scriptDir, files, durationMS) {
        const fileCount = files.length;
        const fileStr = exports.pluralS(fileCount, 'file');
        this.info(this.highlight(fileCount), 'test script ' + fileStr, 'generated', this.formatDuration(durationMS));
    }
    /** @inheritdoc */
    showTestScriptGenerationErrors(errors) {
        for (const err of errors || []) {
            this.showException(err);
        }
    }
    /** @inheritdoc */
    success(...args) {
        this.writeln(this.symbolSuccess, ...args);
    }
    /** @inheritdoc */
    info(...args) {
        this.writeln(this.symbolInfo, ...args);
    }
    /** @inheritdoc */
    warn(...args) {
        this.writeln(this.symbolWarning, ...args);
    }
    /** @inheritdoc */
    error(...args) {
        this.writeln(this.symbolError, ...args);
    }
    /** @inheritdoc */
    showException(error) {
        if (this._debugMode) {
            this.error(error.message, this.formattedStackOf(error));
        }
        else {
            this.error(error.message);
        }
    }
    // /** @inheritDoc */
    // fileReadError( path: string, error: Error ): void {
    //     this.sameLine( this.symbolError, 'Error reading', path, ': ', error.message );
    // }
    // /** @inheritDoc */
    // directoryReadStarted( directory: string, targets: string[], targetsAreFiles: boolean ): void {
    //     this.newLine( this.symbolInfo, 'Reading directory',
    //         this.colorHighlight( directory ) );
    //     const sameExtensionsAsTheDefaultOnes: boolean =
    //         JSON.stringify( targets.sort().map( e => e.toLowerCase() ) ) ===
    //         JSON.stringify( ( new Defaults() ).EXTENSIONS.sort() );
    //     if ( ! sameExtensionsAsTheDefaultOnes ) {
    //         this.newLine(
    //             this.symbolInfo,
    //             'Looking for',
    //             ( targets.map( e => this.colorHighlight( e ) ).join( ', ' ) ),
    //             targetsAreFiles ? '...' : 'files...'
    //         );
    //     }
    // }
    // /** @inheritDoc */
    // directoryReadFinished( data: DirectoryReadResult ): void {
    //     if ( data.fileErrorCount > 0 ) {
    //         if ( -1 == data.dirCount ) {
    //             this.newLine(
    //                 this.symbolError,
    //                 this.colorError( 'Cannot read the informed directory.' )
    //             );
    //             return;
    //         } else {
    //             this.newLine(
    //                 this.symbolError,
    //                 this.colorError( 'File read errors:' ),
    //                 data.fileErrorCount
    //             );
    //         }
    //     }
    //     this.newLine( this.symbolInfo,
    //         data.dirCount, 'directories analyzed,',
    //         this.colorHighlight( data.filesCount + ' files found,' ),
    //         prettyBytes( data.filesSize ),
    //         this.formatDuration( data.durationMs )
    //         );
    // }
    //
    // OptionsListener
    //
    /** @inheritDoc */
    announceConfigurationFileSaved(filePath) {
        this.info('Saved', this.highlight(filePath));
    }
    /** @inheritDoc */
    announceCouldNotLoadConfigurationFile(errorMessage) {
        // empty
    }
    /** @inheritDoc */
    announceConfigurationFileLoaded(filePath, durationMS) {
        this.info('Configuration file loaded:', this.highlight(this._debugMode ? filePath : path_1.basename(filePath)));
    }
    /** @inheritDoc */
    announceSeed(seed, generatedSeed) {
        this.info(generatedSeed ? 'Generated seed' : 'Seed', this.highlight(seed));
    }
    /** @inheritDoc */
    announceRealSeed(realSeed) {
        if (this._debugMode) {
            this.info('Real seed', this.highlight(realSeed));
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
    testCaseGenerationStarted(strategyWarnings) {
        // empty
    }
    /** @inheritDoc */
    testCaseProduced(dirTestCases, filePath, testCasesCount, errors, warnings) {
        const hasErrors = errors && errors.length > 0;
        const hasWarnings = warnings && warnings.length > 0;
        if (!hasErrors && !hasWarnings) {
            return;
        }
        this.showErrors([...errors, ...warnings], true);
    }
    /** @inheritDoc */
    testCaseGenerationFinished(filesCount, testCasesCount, durationMs) {
        this.info(this.highlight(filesCount), 'test case', exports.pluralS(filesCount, 'file'), 'generated:', this.highlight(testCasesCount), exports.pluralS(testCasesCount, 'test case'), 'total', this.formatDuration(durationMs));
    }
    //
    // CompilerListener
    //
    /** @inheritdoc */
    announceFileSearchStarted() {
        // this.startSpinner();
    }
    /** @inheritdoc */
    announceFileSearchFinished(durationMS, filesFoundCount, filesIgnoredCount) {
        // this.stopSpinner();
    }
    /** @inheritDoc */
    announceCompilerStarted(options) {
        // this.startSpinner();
        this.write(this.symbolInfo, 'Compiling...');
    }
    /** @inheritdoc */
    announceCompilerFinished(compiledFilesCount, featuresCount, testCasesCount, durationMS) {
        // this.stopSpinner();
        this.clearLine();
        this.info(this.highlight(compiledFilesCount), exports.pluralS(compiledFilesCount, 'file'), 'compiled:', this.highlight(featuresCount), 'feature', exports.pluralS(featuresCount, 'file'), 'and', this.highlight(testCasesCount), 'testcase', exports.pluralS(testCasesCount, 'file'), this.formatDuration(durationMS));
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
            const color = this.properColor(hasErrors, hasWarnings);
            const symbol = this.properSymbol(hasErrors, hasWarnings);
            const text = path_1.relative(basePath, filePath);
            const link = terminalLink(text, filePath, { fallback: fallback }); // clickable URL
            this.writeln(color(symbol), this.highlight(link));
            this.showErrors([...problemInfo.errors, ...problemInfo.warnings], true);
        }
    }
    //
    // PluginListener
    //
    /** @inheritdoc */
    drawPluginList(plugins) {
        if (plugins.length < 1) {
            this.info('No plugins found. Try to install a plugin with NPM.');
            return;
        }
        // const highlight = this.colorHighlight;
        // const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        // this.newLine( highlight( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        // for ( let p of plugins ) {
        //     this.newLine( sprintf( format, p.name, p.version, p.description ) );
        // }
        const highlight = this.highlight;
        const format = "%-15s";
        this.info(highlight('Available Plugins:'));
        for (let p of plugins) {
            this.writeln(' ');
            this.writeln(highlight(sprintf_js_1.sprintf(format, '  Name')), p.name);
            this.writeln(highlight(sprintf_js_1.sprintf(format, '  Version')), p.version);
            this.writeln(highlight(sprintf_js_1.sprintf(format, '  Description')), p.description);
        }
    }
    /** @inheritdoc */
    drawSinglePlugin(p) {
        const format = "  - %-12s: %s"; // util.format does not support padding :(
        const authors = p.authors.map((a, idx) => 0 === idx ? a : sprintf_js_1.sprintf('%-17s %s', '', a));
        this.info(sprintf_js_1.sprintf('Plugin %s', this.highlight(p.name)));
        this.writeln(sprintf_js_1.sprintf(format, 'version', p.version));
        this.writeln(sprintf_js_1.sprintf(format, 'description', p.description));
        this.writeln(sprintf_js_1.sprintf(format, 'authors', authors.join('\n')));
        this.writeln(sprintf_js_1.sprintf(format, 'file', this._debugMode ? p.file : path_1.basename(p.file)));
        this.writeln(sprintf_js_1.sprintf(format, 'class', p.class));
    }
    /** @inheritdoc */
    showMessagePluginNotFound(name) {
        this.error(sprintf_js_1.sprintf('No plugins installed with the name "%s".', this.highlight(name)));
    }
    /** @inheritdoc */
    showMessagePluginAlreadyInstalled(name) {
        this.info(sprintf_js_1.sprintf('The plugin %s is already installed.', this.highlight(name)));
    }
    /** @inheritdoc */
    showMessageTryingToInstall(name, tool) {
        this.info(sprintf_js_1.sprintf('Trying to install %s with %s.', this.highlight(name), tool));
    }
    /** @inheritdoc */
    showMessageTryingToUninstall(name, tool) {
        this.info(sprintf_js_1.sprintf('Trying to uninstall %s with %s.', this.highlight(name), tool));
    }
    /** @inheritdoc */
    showMessageCouldNoFindInstalledPlugin(name) {
        this.info(sprintf_js_1.sprintf('Could not find installed plug-in %s. Please try again.', this.highlight(name)));
    }
    /** @inheritdoc */
    showMessagePackageFileNotFound(file) {
        this.warn(sprintf_js_1.sprintf('Could not find %s. I will create it for you.', this.highlight(file)));
    }
    /** @inheritdoc */
    showPluginServeStart(name) {
        this.info(sprintf_js_1.sprintf('Serving %s...', this.highlight(name)));
    }
    /** @inheritdoc */
    showCommandStarted(command) {
        this.writeln('  Running', this.highlight(command));
        this.drawSeparationLine();
    }
    /** @inheritdoc */
    showCommandFinished(code, showIfSuccess = true) {
        this.drawSeparationLine();
        if (0 === code) {
            if (showIfSuccess) {
                this.success('Success');
            }
        }
        else {
            this.error('Error during command execution.');
        }
    }
    drawSeparationLine() {
        const separationLine = '  ' + '_'.repeat(78);
        this.writeln(this.colorDiscreet(separationLine));
    }
    /** @inheritdoc */
    showError(e) {
        this.error(e.message);
    }
    //
    // ScriptExecutionListener
    //
    /** @inheritDoc */
    announceTestScriptExecutionStarted() {
        this.info('Executing test scripts...');
        this.drawSeparationLine();
    }
    /** @inheritDoc */
    testScriptExecutionDisabled() {
        this.info('Script execution disabled.');
    }
    /** @inheritDoc */
    announceTestScriptExecutionError(error) {
        this.showException(error);
    }
    /** @inheritDoc */
    announceTestScriptExecutionFinished() {
        this.drawSeparationLine();
    }
    /** @inheritDoc */
    showTestScriptAnalysis(r) {
        let t = r.total;
        if (!t.tests) {
            this.info('No tests executed.');
            return;
        }
        this.info('Test execution results:', "\n");
        const passedStr = t.passed ? this.bgSuccess(t.passed + ' passed') : '';
        const failedStr = t.failed ? this.bgError(t.failed + ' failed') : '';
        const adjustedStr = t.adjusted ? this.bgCyan(t.adjusted + ' adjusted') : '';
        const errorStr = t.error ? this.bgCriticalError(t.error + ' with error') : '';
        const skippedStr = t.skipped ? t.skipped + ' skipped' : '';
        const totalStr = (t.tests || '0') + ' total';
        this.writeln('  ', [passedStr, adjustedStr, failedStr, errorStr, skippedStr, totalStr].filter(s => s.length > 0).join(', '), this.colorDiscreet('in ' + TimeFormat_1.millisToString(r.durationMs, null, ' ')), "\n");
        if (0 == t.failed && 0 == t.error) {
            return;
        }
        const msgReason = this.colorDiscreet('       reason:');
        const msgScript = this.colorDiscreet('       script:');
        const msgDuration = this.colorDiscreet('     duration:');
        const msgTestCase = this.colorDiscreet('    test case:');
        for (let tsr of r.results) {
            for (let m of tsr.methods) {
                let e = m.exception;
                if (!e) {
                    continue;
                }
                let color = this.cliColorForStatus(m.status);
                let sLoc = e.scriptLocation;
                let tcLoc = e.specLocation;
                this.writeln('  ', this.symbolItem, ' '.repeat(9 - m.status.length) + color(m.status + ':'), this.highlight(tsr.suite), this.symbolPointer, this.highlight(m.name), "\n", msgReason, e.message, "\n", msgScript, this.highlight(sLoc.filePath), '(' + sLoc.line + ',' + sLoc.column + ')', "\n", msgDuration, this.colorDiscreet(m.durationMs + 'ms'), "\n", msgTestCase, this.colorDiscreet(tcLoc.filePath, '(' + tcLoc.line + ',' + tcLoc.column + ')'), "\n");
            }
        }
    }
    //
    // OTHER
    //
    cliColorForStatus(status) {
        switch (status.toLowerCase()) {
            case 'passed': return this.colorSuccess;
            case 'adjusted': return this.colorCyanBright;
            case 'failed': return this.colorError;
            case 'error': return this.colorCriticalError;
            default: return this.colorText;
        }
    }
    showErrors(errors, showSpaces) {
        if (!errors || errors.length < 1) {
            return;
        }
        const sortedErrors = ErrorSorting_1.sortErrorsByLocation(errors);
        const spaces = ' ';
        for (let e of sortedErrors) {
            const symbol = e.isWarning ? this.symbolWarning : this.symbolError;
            let msg = this._debugMode
                ? e.message + ' ' + this.formattedStackOf(e)
                : e.message;
            if (showSpaces) {
                this.writeln(spaces, symbol, msg);
            }
            else {
                this.writeln(symbol, msg);
            }
        }
    }
    formattedStackOf(err) {
        return "\n  DETAILS: " + err.stack.substring(err.stack.indexOf("\n"));
    }
    // private formatHash( hash: string ): string {
    //     return this.colorInfo( hash.substr( 0, 8 ) );
    // }
    formatDuration(durationMs) {
        // if ( durationMs < 0 ) {
        //     return '';
        // }
        return this.colorDiscreet('(' + durationMs.toString() + 'ms)');
    }
}
exports.SimpleUI = SimpleUI;
