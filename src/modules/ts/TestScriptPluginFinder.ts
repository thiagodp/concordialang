import { TestScriptPlugin } from './TestScriptPlugin';

/**
 * Finds plug-ins that generate and execute test scripts.
 */
export interface TestScriptPluginFinder {

    find(): TestScriptPlugin[];
    
}