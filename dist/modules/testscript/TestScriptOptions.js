"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Test script generation options.
 *
 * @author Thiago Delgado Pinto
 */
class TestScriptGenerationOptions {
    /**
     * Constructor
     *
     * @param pluginName Plugin name
     * @param sourceCodeDir Directory for the source code
     */
    constructor(pluginName = null, sourceCodeDir = null) {
        this.pluginName = pluginName;
        this.sourceCodeDir = sourceCodeDir;
    }
}
exports.TestScriptGenerationOptions = TestScriptGenerationOptions;
