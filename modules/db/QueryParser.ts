import { matches } from '../util/matches';

/**
 * @author Thiago Delgado Pinto
 */
export class QueryParser {

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

    /**
     * Parse Concordia variables, in the format {anything}.
     *
     * @param command Command to parse.
     * @returns Parsed variables
     */
    public parseAnyVariables( command: string ): string[] {
        const regex = /(?:\{)([^}]+)(?:\})/g;
        return matches( regex, command, true );
    }

    /**
     * Parse Concordia names, in the format [anything], ignoring contents with dollar ($).
     *
     * @param command Command to parse.
     * @returns Parsed variables
     */
    public parseAnyNames( command: string ): string[] {
        //const regex = /(?:\{\{)([^}}]+)(?:\}\})/g;
        const regex = /(?:\[)([^\$\]]+)(?:\])/g;
        return matches( regex, command, true );
    }


    /**
     * Returns a regex for the given variable name.
     *
     * @param name Name
     */
    public makeVariableRegex( name: string ): RegExp {
        return new RegExp( '(?:\\{)(' + name + ')(?:\\})', 'gui' );
    }

    /**
     * Returns a regex for the given name.
     *
     * @param name Name
     * @param replaceDot Whether is desired to replace dot. Optional. Default is false.
     */
    public makeNameRegex( name: string, replaceDot: boolean = false ): RegExp {
        let exp = '(?:\\[)(' + name + ')(?:\\])';
        if ( replaceDot ) {
            exp += '\.?';
        }
        return new RegExp( exp, 'gui' );
    }

}
