import { Database } from "../ast/Database";

/**
 * Database interface
 * 
 * @author Thiago Delgado Pinto
 */
export interface DatabaseInterface {

    /**
     * Checks if the database is connected.
     */
    isConnected(): Promise< boolean >;

    /**
     * Connects to the database.
     */    
    connect( db: Database ): Promise< boolean >;

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
    exec( cmd: string, params?: any ): Promise< any[] >;

    /**
     * Queries the database.
     * 
     * @param cmd Command to execute.
     * @param params Parameters of the command. Optional.
     * @return A promise to an array of values, usually objects.
     */
    query( cmd: string, params?: any ): Promise< any[] >;
    
}