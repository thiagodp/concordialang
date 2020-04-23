"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    showGeneratedTestScriptFiles(scriptDir, files, durationMS) {
        super.showGeneratedTestScriptFiles(scriptDir, files, durationMS);
        // When the terminal does not support links
        const fallback = (text, url) => {
            return text;
        };
        for (const file of files) {
            const relPath = path_1.relative(scriptDir, file);
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
    /** @inheritDoc */
    announceRealSeed(realSeed) {
        this.info('Real seed', this.highlight(realSeed));
    }
    //
    // CompilerListener
    //
    /** @inheritdoc */
    announceFileSearchFinished(durationMS, files) {
        // this.stopSpinner();
        const len = files.length;
        this.info(this.highlight(len), SimpleUI_1.pluralS(len, 'file'), 'given', this.formatDuration(durationMS));
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
}
exports.VerboseUI = VerboseUI;
