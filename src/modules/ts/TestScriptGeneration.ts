// WARNING: WIP !!!

/**
 * Test script generation options.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptGenerationOptions {
    public pluginName: string = null; // target plugin
    public scriptDir: string = null; // directory where to place the files with test scripts
}


/**
 * Test script generation status.
 * 
 * @author Thiago Delgado Pinto
 */
export enum TestScriptGenerationResultStatus {
    SUCCESS = 1
    // , ... <= 0
}

/**
 * Test script generation result.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptGenerationResult {
    public status: TestScriptGenerationResultStatus = TestScriptGenerationResultStatus.SUCCESS;
    public scriptFiles: string[]; // generated script files
}