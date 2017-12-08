import { TestScriptPluginData } from './TestScriptPluginData';

/**
 * Finds plug-ins that generate and execute test scripts.
 * 
 * @author Thiago Delgado Pinto
 */
export interface TestScriptPluginFinder {

    find(): Promise< TestScriptPluginData[] >;
    
}