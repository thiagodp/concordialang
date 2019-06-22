export interface Queryable {

    /**
     * Queries the database.
     * 
     * @param cmd Command to execute.
     * @param params Parameters of the command. Optional.
     * @return A promise to an array of values, usually objects.
     */
    query( cmd: string, params?: any[] ): Promise< any[] >;
        
}