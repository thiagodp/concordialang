import { QueryParser } from './QueryParser';
import { escapeId, escape } from 'sqlstring';
import { isNumber } from '../util/TypeChecking';

/**
 * Replaces references to Concordia constructions - such as named databases,
 * named tables, ui element names, and constants - with their corresponding values.
 * 
 * @author Thiago Delgado Pinto
 */
export class ReferenceReplacer {

    /**
     * @param _sentenceMode When false (default), values are wrapped for queries. Otherwise for sentences.
     */
    constructor( private _sentenceMode: boolean = false ) {
    }

    /**
     * Replaces names and values in a query or sentence.
     * 
     * @param sentence Query or sentence to replace.
     * @param databaseNameToNameMap 
     * @param tableNameToNameMap 
     * @param fieldNameToValueMap 
     * @param constantNameToValueMap
     * @returns A query with all the replacements.
     */
    public replace(
        sentence: string,
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

        return this.replaceAll( sentence, varMap, constMap );
    }


    private replaceAll( sentence: string, varMap: object, constMap: object ): string {
        let s = sentence;
        for ( let varName in varMap ) {
            const regex = this.makeVarRegex( varName );
            const value = varMap[ varName ];
            s = s.replace( regex, value );
        }
        for ( let constName in constMap ) {
            const regex = this.makeNameRegex( constName );
            const value = constMap[ constName ];
            s = s.replace( regex, value );
        }
        return s;
    }


    private wrapName( content: string ): string {
        if ( this._sentenceMode ) {
            return escapeId( content ).replace( /\`/g, '"' );
        }
        return escapeId( content );
    }

    private wrapValue( content: string | number ): string | number {
        if ( this._sentenceMode ) {
            if ( isNumber( content ) ) {
                return content;
            }
            return escape( content ).replace( /\'/g, '"' );
        }        
        return escape( content );
    }

    private makeVarRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeVariableRegex( name );
    }

    private makeNameRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeNameRegex( name );
    }    

}