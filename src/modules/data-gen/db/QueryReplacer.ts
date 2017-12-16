import { QueryParser } from './QueryParser';
import * as SqlString from 'sqlstring';

/**
 * @author Thiago Delgado Pinto
 */
export class QueryReplacer {

    /**
     * Replaces names and values in a query.
     * 
     * @param query Query to replace
     * @param databaseNameToNameMap 
     * @param tableNameToNameMap 
     * @param fieldNameToValueMap 
     * @param constantNameToValueMap
     * @returns A query with all the replacements.
     */
    public replace(
        query: string,
        databaseNameToNameMap: object,
        tableNameToNameMap: object,
        fieldNameToValueMap: object,
        constantNameToValueMap: object
    ): string {
        let varMap = {};

        // Wrap field names
        for ( let name in fieldNameToValueMap ) {
            varMap[ name ] = this.wrapValue( fieldNameToValueMap[ name ] );
        }

        let constMap = {};

        // Wrap database names
        for ( let name in databaseNameToNameMap ) {
            constMap[ name ] = this.wrapName( databaseNameToNameMap[ name ] );
        }        

        // Wrap table names
        for ( let name in tableNameToNameMap ) {
            constMap[ name ] = this.wrapName( tableNameToNameMap[ name ] );
        }        

        // Wrap constant names
        for ( let name in constantNameToValueMap ) {
            constMap[ name ] = this.wrapValue( constantNameToValueMap[ name ] );
        }

        return this.replaceAll( query, varMap, constMap );
    }


    private replaceAll( query: string, varMap: object, constMap: object ): string {
        let q = query;
        for ( let varName in varMap ) {
            const regex = this.makeVarRegex( varName );
            const value = varMap[ varName ];
            q = q.replace( regex, value );
        }
        for ( let constName in constMap ) {
            const regex = this.makeNameRegex( constName );
            const value = constMap[ constName ];
            q = q.replace( regex, value );
        }
        return q;
    }


    private wrapName( content: string ): string {
        //return '`' + content + '`'; // TO-DO: sql injection protection
        return SqlString.escapeId( content );
    }

    private wrapValue( content: string ): string {
        //return '"' + content + '"'; // TO-DO: sql injection protection
        return SqlString.escape( content );
    }

    private makeVarRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeVariableRegex( name );
    }

    private makeNameRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeNameRegex( name );
    }    

}