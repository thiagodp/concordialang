import { PluginData } from './PluginData';

/**
 * Finds plug-ins that generate and execute test scripts.
 *
 * @author Thiago Delgado Pinto
 */
export interface PluginFinder {

    /**
     * Finds plug-ins and returns their data.
     */
    find(): Promise< PluginData[] >;

    /**
     * Returns the path of a plug-in class file.
     *
     * @param pluginData Plug-in data
     */
    classFileFor( pluginData: PluginData ): Promise< string >;

}