"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerboseUI = void 0;
const path_1 = require("path");
const terminalLink = require("terminal-link");
const SimpleUI_1 = require("./SimpleUI");
class VerboseUI extends SimpleUI_1.SimpleUI {
    /** @inheritdoc */
    announceOptions(options) {
        super.announceOptions(options);
        const disabledStr = this.highlight('disabled');
        // Recursive
        if (!options.recursive) {
            this.info('Directory recursion', disabledStr);
        }
        if (!options.spec) {
            this.info('Specification compilation', disabledStr);
        }
        else {
            if (!options.testCase) {
                this.info('Test Case generation', disabledStr);
            }
        }
        if (!options.script) {
            this.info('Test script generation disabled', disabledStr);
        }
        if (!options.run) {
            this.info('Test script execution', disabledStr);
        }
        if (!options.result) {
            this.info('Test script results\' analysis', disabledStr);
        }
        if (!options.spec
            && !options.testCase
            && !options.script
            && !options.run
            && !options.result) {
            this.warn('Well, you have disabled all the interesting behavior. :)');
        }
    }
    /** @inheritdoc */
    showGeneratedTestScriptFiles(scriptDir, files, durationMS) {
        super.showGeneratedTestScriptFiles(scriptDir, files, durationMS);
        // When the terminal does not support links
        const fallback = (text, url) => {
            return text;
        };
        for (const file of files) {
            const relPath = path_1.relative(path_1.dirname(scriptDir), file);
            const link = terminalLink(relPath, file, { fallback: fallback }); // clickable URL
            this.success('Generated script', this.highlight(link));
        }
    }
    //
    // FileCompilationListener
    //
    /** @inheritDoc */
    fileStarted(path) {
        this.info('Compiling', this.highlight(path), '...');
    }
    //
    // OptionsListener
    //
    /** @inheritDoc */
    announceConfigurationFileLoaded(filePath, durationMS) {
        this.info('Configuration file loaded:', this.highlight(this._debugMode ? filePath : path_1.basename(filePath)), this.formatDuration(durationMS));
    }
    /** @inheritDoc */
    announceCouldNotLoadConfigurationFile(errorMessage) {
        // this.warn(
        //     'Could not load the configuration file:',
        //     errorMessage
        //     );
        const msg = 'Could not load the configuration file';
        if (this._debugMode) {
            this.warn(msg + ':', errorMessage);
            return;
        }
        this.warn(msg);
    }
    //
    // CompilerListener
    //
    /** @inheritdoc */
    announceFileSearchFinished(durationMS, filesFoundCount, filesIgnoredCount) {
        if (0 === filesFoundCount) {
            super.announceFileSearchFinished(durationMS, filesFoundCount, filesIgnoredCount);
            return;
        }
        this.info(this.highlight(filesFoundCount), SimpleUI_1.pluralS(filesFoundCount, 'file'), 'given,', this.highlight(filesIgnoredCount), 'test case', SimpleUI_1.pluralS(filesIgnoredCount, 'file'), 'ignored', this.formatDuration(durationMS));
    }
    //
    // TCGenListener
    //
    /** @inheritDoc */
    testCaseGenerationStarted(strategyWarnings) {
        if (strategyWarnings.length > 0) {
            this.info('Test case generation started');
            this.showErrors(strategyWarnings, true);
        }
    }
    /** @inheritDoc */
    testCaseProduced(dirTestCases, filePath, testCasesCount, errors, warnings) {
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        const successful = !hasErrors && !hasWarnings;
        const color = successful ? this.colorSuccess : this.properColor(hasErrors, hasWarnings);
        const symbol = successful ? this.symbolSuccess : this.properSymbol(hasErrors, hasWarnings);
        this.writeln(color(symbol), 'Generated', this.highlight(path_1.relative(dirTestCases, filePath)), 'with', this.highlight(testCasesCount), SimpleUI_1.pluralS(testCasesCount, 'test case'));
        if (!hasErrors && !hasWarnings) {
            return;
        }
        this.showErrors([...errors, ...warnings], true);
    }
}
exports.VerboseUI = VerboseUI;
