import { PluginData } from './PluginData';

/**
 * Finds plug-ins that generate and execute test scripts.
 * 
 * @author Thiago Delgado Pinto
 */
export interface PluginFinder {

    find(): Promise< PluginData[] >;
    
}