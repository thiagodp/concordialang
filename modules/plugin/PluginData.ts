
/**
 * Property that must be declared in a package file of a plugin.
 */
export const PLUGIN_PROPERTY: string = 'concordiaPlugin';

/**
 * Prefix for plug-ins.
 */
export const PLUGIN_PREFIX: string = 'concordialang-';

/**
 * Test script plugin data.
 *
 * @author Thiago Delgado Pinto
 */
export interface PluginData {

    /** Plugin name. */
    name: string;

    /** Plugin description. */
    description: string;

    /** Plugin version. */
    version: string;

    /** Plugin authors. */
    authors?: string[];

    // --- main properties ---

    /** Path to file to be loaded. */
    file: string;

    /** Class that implements the interface `Plugin`. */
    class: string;

    /** Command to start a testing server, whether needed. */
    serve?: string;

}