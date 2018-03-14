import { Symbols } from "../req/Symbols";

export class NameUtil {

    /**
     * Retrieves a feature name from a string in the format 'feature:variable' or 'variable'.
     * Whether a variable does not have a feature, it returns null.
     *
     * @param variable Variable
     */
    public extractFeatureNameOf( variable: string ): string | null {
        const index = variable.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR );
        if ( index < 0 ) {
            return null;
        }
        return variable.substring( 0, index );
    }

    /**
     * Retrieves a variable name from a string in the format 'feature:variable' or 'variable'.
     *
     * @param variable Variable
     */
    public extractVariableNameOf( variable: string ): string {
        const index = variable.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR );
        if ( index < 0 ) {
            return variable;
        }
        if ( 1 === variable.length ) {
            return '';
        }
        return variable.split( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR )[ 1 ];
    }

}