"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleAppUI_1 = require("./SimpleAppUI");
class VerboseAppUI extends SimpleAppUI_1.SimpleAppUI {
    //
    // FileCompilationListener
    //
    /** @inheritDoc */
    fileStarted(path) {
        this._cli.newLine(this._cli.symbolInfo, 'Compiling', this._cli.colorHighlight(path), '...');
    }
    //
    // OptionsListener
    //
    /** @inheritDoc */
    announceRealSeed(realSeed) {
        this.info('Real seed', this._cli.colorHighlight(realSeed));
    }
    //
    // CompilerListener
    //
    //
    // TCGenListener
    //
    /** @inheritDoc */
    testCaseGenerationStarted(warnings) {
        this._cli.newLine(this._cli.symbolInfo, 'Test case generation started');
        this.showErrors(warnings, true);
    }
    /** @inheritDoc */
    testCaseGenerationFinished(durationMs) {
        this._cli.newLine(this._cli.symbolInfo, 'Test case generation finished', this.formatDuration(durationMs));
    }
}
exports.VerboseAppUI = VerboseAppUI;
