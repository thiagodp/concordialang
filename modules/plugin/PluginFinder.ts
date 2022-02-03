import { NewOrOldPluginData } from './PluginData';

/**
 * Finds plug-ins that generate and execute test scripts.
 *
 * @author Thiago Delgado Pinto
 */
export interface PluginFinder {

    /**
     * Finds plug-ins and returns their data.
     */
    find(): Promise< NewOrOldPluginData[] >;

}
