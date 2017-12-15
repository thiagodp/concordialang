/**
 * @author Thiago Delgado Pinto
 */
export class QueryParser {

    // private readonly VARIABLE_THEN_ONE_DOT: RegExp = /(?:\$\{)([^\}]+)(?:\})\..+/g;
    // private readonly VARIABLE_NOT_PRECEDED_BY_DOT: RegExp = /(?:\$\{)([^\}]+)(?:\})(?!\.)/g;
    // private readonly CONSTANT: RegExp = /(?:\{\{)([^}}]+)(?:\}\})/g;

    // SQL PARSING
    //
    // ${field}
    // {{constant}} or {{table name}} or {{database name}} ?
    //
    // `database name`.`table name`   << normal
    // ${database name}.${table name} << reference
    // {database name}.{table name}   << reference
    //
    // Ex:
    // - valor vem de 'SELECT campo1, campo2 FROM ${table} WHERE campo1 = ${campoX}
    // - valor vem de 'SELECT campo1, campo2 FROM ${db}.${table} WHERE campo1 = ${campoX}
    //                                                              AND campo2 = {{const1}}
    //
    // Entre FROM e WHERE: -> ${table} ou ${database}.${table}
    // Após WHERE: -> ${campo} ou {{constante}}
    //
    // Idea is replacing fields/constants/etc with the corresponding "real" values.
    //
    //  - constants with their values;
    //
    //  - database names DO NOT NEED to be replaced, but to be removed from the
    //    command AND the corresponding command be attached to the database
    //    during the processing (one db has many commands);
    //
    //  - fields with their corresponding generated values for the test case,
    //    only when the test cases need to be generated.
    //
    // Notes on limitations:
    //  - Queries cannot select from more than one database
    //


    // /**
    //  * Returns parsed database variables.
    //  * 
    //  * Example 'SELECT ${table1}.fieldX, tbl2.fieldY, ${table2}.fieldY
    //  *          FROM ${db}.${table1}, ${table2}, tbl3
    //  *          WHERE ${table1}.fieldX = ${fieldA} OR
    //  *              ${table2}.fieldY = {{const1}}'
    //  * 
    //  *          will return [ 'db' ]
    //  * 
    //  * @param query Query to parse.
    //  */    
    // public parseDatabasesVariables( query: string ): string[] {
    //     const content = this.parseAnythingBetweenFromAndWhere( query );
    //     const regex = this.VARIABLE_THEN_ONE_DOT;
    //     const databases = this.matches( regex, content );
    //     // Return an array without duplications
    //     return Array.from( new Set( databases ) );
    // }

    // /**
    //  * Returns parsed table variables.
    //  * 
    //  * Example 'SELECT ${table1}.fieldX, tbl2.fieldY, ${table2}.fieldY
    //  *          FROM ${db}.${table1}, ${table2}, tbl3
    //  *          WHERE ${table1}.fieldX = ${fieldA} OR
    //  *              ${table2}.fieldY = {{const1}}'
    //  * 
    //  *          will return [ 'table1', 'table2' ]
    //  * 
    //  * @param query Query to parse.
    //  */
    // public parseTablesVariables( query: string ): string[] {
    //     let tables: string[] = [];

    //     // Between SELECT and FROM
    //     const selectContent = this.parseAnythingBetweenSelectAndFrom( query );
    //     const selectRegex = this.VARIABLE_THEN_ONE_DOT;
    //     const selectResults = this.matches( selectRegex, selectContent );
    //     tables.push.apply( tables, selectResults );

    //     const hasWhere = this.hasWhere( query );

    //     // Between FROM and WHERE
    //     const fromContent = hasWhere
    //         ? this.parseAnythingBetweenFromAndWhere( query )
    //         : this.parseAnythingAfterFrom( query );
    //     const fromRegex = this.VARIABLE_NOT_PRECEDED_BY_DOT;
    //     const fromResults = this.matches( fromRegex, fromContent );
    //     tables.push.apply( tables, fromResults );

    //     // After WHERE
    //     if ( hasWhere ) {
    //         const whereContent = this.parseAnythingAfterWhere( query );
    //         const whereRegex = this.VARIABLE_THEN_ONE_DOT;
    //         const whereResults = this.matches( whereRegex, whereContent );
    //         tables.push.apply( tables, whereResults );
    //     }

    //     // Return an array without duplications
    //     return Array.from( new Set( tables ) );
    // }

    // /**
    //  * Returns parsed field variables.
    //  * 
    //  * Example 'SELECT ${table1}.fieldX, tbl2.fieldY, ${table2}.fieldY
    //  *          FROM ${db}.${table1}, ${table2}, tbl3
    //  *          WHERE ${table1}.fieldX = ${fieldA} OR
    //  *              ${table2}.fieldY = {{const1}}'
    //  * 
    //  *          will return [ 'fieldA' ]
    //  * 
    //  * @param query Query to parse.
    //  */    
    // public parseFieldVariables( query: string ): string[] {
    //     const content = this.parseAnythingAfterWhere( query );
    //     const regex = this.VARIABLE_NOT_PRECEDED_BY_DOT;
    //     const fields = this.matches( regex, content );
    //     // Return an array without duplications
    //     return Array.from( new Set( fields ) );
    // }

    // /**
    //  * Returns parsed constants.
    //  * 
    //  * Example 'SELECT ${table1}.fieldX, tbl2.fieldY, ${table2}.fieldY
    //  *          FROM ${db}.${table1}, ${table2}, tbl3
    //  *          WHERE ${table1}.fieldX = ${fieldA} OR
    //  *              ${table2}.fieldY = {{const1}}'
    //  * 
    //  *          will return [ 'const1' ]
    //  * 
    //  * @param query Query to parse.
    //  */     
    // public parseConstants( query: string ): string[] {
    //     const content = this.parseAnythingAfterWhere( query );
    //     const regex = this.CONSTANT;
    //     const constants = this.matches( regex, content );
    //     // Return an array without duplications
    //     return Array.from( new Set( constants ) );
    // }

    // public hasSelect( query: string ): boolean {
    //     return ( ' ' + query ).toLowerCase().indexOf( ' select ' ) >= 0;
    // }    

    // public hasFrom( query: string ): boolean {
    //     return query.toLowerCase().indexOf( ' from ' ) >= 0;
    // }

    // public hasWhere( query: string ): boolean {
    //     return query.toLowerCase().indexOf( ' where ' ) >= 0;
    // }

    // public parseAnythingAfterSelect( query: string ): string {
    //     const result = this.matches( /(?:SELECT)(.*)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';
    // }    

    // public parseAnythingBetweenSelectAndFrom( query: string ): string {
    //     const result = this.matches( /(?:SELECT)(.*)(?:FROM)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';
    // }

    // public parseAnythingBetweenFromAndWhere( query: string ): string {
    //     const result = this.matches( /(?:FROM)(.*)(?:WHERE)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';
    // }

    // public parseAnythingBetweenSelectAndWhere( query: string ): string {
    //     const result = this.matches( /(?:SELECT)(.*)(?:WHERE)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';
    // }    

    // public parseAnythingAfterFrom( query: string ): string {
    //     const result = this.matches( /(?:FROM)(.+)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';        
    // }    

    // public parseAnythingAfterWhere( query: string ): string {
    //     const result = this.matches( /(?:WHERE)(.+)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';        
    // }

    // public parseAnythingBeforeFrom( query: string ): string {
    //     const result = this.matches( /(.+)(?:FROM)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';        
    // }

    // public parseAnythingBeforeWhere( query: string ): string {
    //     const result = this.matches( /(.+)(?:WHERE)/gi, query );
    //     return result.length > 0 ? result[ 0 ] : '';        
    // }    
    
    /**
     * Parse Concordia variables, in the format ${anything}.
     * 
     * @param command Command to parse.
     * @returns Parsed variables
     */
    public parseAnyVariables( command: string ): string[] {
        const regex = /(?:\$\{)([^}]+)(?:\})/g;
        return this.matches( regex, command );
    }

    /**
     * Parse Concordia constans, in the format {{anything}}.
     * 
     * @param command Command to parse.
     * @returns Parsed variables
     */
    public parseAnyConstants( command: string ): string[] {
        const regex = /(?:\{\{)([^}}]+)(?:\}\})/g;
        return this.matches( regex, command );
    }

    /**
     * Returns matched values.
     * 
     * @param regex Regex
     * @param text Text
     */
    public matches( regex: RegExp, text: string ): string[] {
        let results: string[] = [];
        let m;
        while ( ( m = regex.exec( text ) ) !== null ) {
            // This is necessary to avoid infinite loops with zero-width matches
            if ( m.index === regex.lastIndex ) {
                regex.lastIndex++;
            }

            m.forEach( ( match, groupIndex ) => {
                if ( 0 === groupIndex ) { // ignores the full match
                    return;
                }
                results.push( match );
            } );
        }
        return results;
    }

}