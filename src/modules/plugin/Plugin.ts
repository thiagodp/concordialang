/**
 * Plugin interface.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Plugin {

    /** Returns true if the plugin is fake (i.e. for demonstration purposes). */
    isFake(): boolean;

    /** Returns the plugin name. */
    name(): string;

    /** Returns the plugin description. */
    description(): string;

    /** Returns the plugin version. */
    version(): string;

    /** Returns the target technologies (e.g. frameworks). */
    targets(): string[];

}
