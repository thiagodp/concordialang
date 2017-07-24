/**
 * Token types
 */
export abstract class TokenTypes {

    static EMPTY: string = 'empty'; // ignorable
    static FEATURE: string = 'feature';
    static SCENARIO: string = 'scenario';

    /**
     * Returns the tokens that are variable, that is, those based on a dictionary.
     */
    static variableTypes(): Array< string > {
        return [
            TokenTypes.FEATURE
            , TokenTypes.SCENARIO
        ];
    }
}