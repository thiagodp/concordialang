/**
 * Test script generation options.
 *
 * @author Thiago Delgado Pinto
 */
export class TestScriptGenerationOptions {

    /**
     * Constructor
     *
     * @param pluginName Plugin name
     * @param sourceCodeDir Directory for the source code
     */
    constructor(
        public pluginName: string = null,
        public sourceCodeDir: string = null
    ) {
    }

}