import { RegexUtil } from '../util/RegexUtil';

/**
 * @author Thiago Delgado Pinto
 */
export class QueryParser {

    private _regexUtil = new RegexUtil();

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
        return this._regexUtil.matches( regex, command, true );
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
        return this._regexUtil.matches( regex, command, true );
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
     */    
    public makeNameRegex( name: string ): RegExp {
        return new RegExp( '(?:\\[)(' + name + ')(?:\\])', 'gui' );
    }    

}