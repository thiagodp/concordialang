import { Database } from "../ast/Database";
import { Queryable } from "./Queryable";

/**
 * Database interface
 * 
 * @author Thiago Delgado Pinto
 */
export interface DatabaseInterface extends Queryable {

    /**
     * Returns true if the given database type driver is based on a connection to a file.
     * 
     * @param databaseType Database type
     */
    hasFileBasedDriver( databaseType: string ): boolean;

    /**
     * Checks if the database is connected.
     */
    isConnected(): Promise< boolean >;

    /**
     * Connects to the database.
     */    
    connect( db: Database, basePath?: string ): Promise< boolean >;

    /**
     * Disconnects from the database.
     */     
    disconnect(): Promise< boolean >;

    /**
     * Reconnect to the database.
     */
    reconnect(): Promise< boolean >;

    /**
     * Executes a command.
     * 
     * @param cmd Command to execute.
     * @param params Parameters of the command. Optional.
     * @return A promise to an array of values, usually objects.
     */
    exec( cmd: string, params?: any[] ): Promise< any[] >;
    
    
    /// @see more methods in Queryable
    
}