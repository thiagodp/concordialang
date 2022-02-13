// import { escape } from 'sqlstring';
import * as sqlstring from 'sqlstring';

import { QueryParser } from '../../db/QueryParser';

const { escape } = sqlstring;

/**
 * Query reference replacer
 *
 * @author Thiago Delgado Pinto
 */
export class QueryReferenceReplacer {

    replaceConstantInQuery( query: string, variable: string, value: any ): string {
        const regex = this.makeNameRegex( variable );
        return query.replace( regex, this.wrapValue( value ) );
    }

    replaceUIElementInQuery(
		query: string,
		variable: string,
		value: any
	): string {
        const regex = this.makeVarRegex( variable );
		return query.replace( regex, this.wrapValue( value ) );
    }

    replaceDatabaseInQuery( query: string, variable: string, removeFrom: boolean ): string {
        let newQuery: string = query;
        if ( removeFrom ) {
            const fromRegex = / from /gi;
            newQuery = query.replace( fromRegex, ' ' );
        }
        // Removes the Database variable
        const dbNameRegex = this.makeNameRegex( variable, true );
        return newQuery.replace( dbNameRegex, '' );
    }

    replaceTableInQuery( query: string, variable: string, internalName: string ): string {
        const regex = this.makeNameRegex( variable );
        return query.replace( regex, internalName );
    }

    wrapValue( content: any ): string {
        return escape( content );
    }

    // private wrapName( content: string ): string {
    //     return escapeId( content );
    // }

    private makeVarRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeVariableRegex( name );
    }

    /**
     * Make a regex for a Concordia name: constant, table or database.
     *
     * @param name Name
     * @param replaceDot Whether is desired to replace dot. Optional. Default is false.
     */
    private makeNameRegex( name: string, replaceDot: boolean = false ): RegExp {
        return ( new QueryParser() ).makeNameRegex( name, replaceDot );
    }

}
