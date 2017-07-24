/**
 * Keywords
 */
export abstract class Keywords {

    static FEATURE: string = 'feature';
    static SCENARIO: string = 'scenario';

    static IMPORT: string = 'import';    

    /**
     * Returns the tokens that are variable, that is, those based on a dictionary.
     */
    static variableTypes(): Array< string > {
        return [
            Keywords.FEATURE
            , Keywords.SCENARIO
            , Keywords.IMPORT
        ];
    }
}