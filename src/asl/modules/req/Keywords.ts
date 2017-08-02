/**
 * Keywords to identify nodes.
 */
export abstract class Keywords {

    static COMMENT: string = 'comment';
    static TAG: string = 'tag';
    static LANGUAGE: string = 'language';

    static FEATURE: string = 'feature';
    static SCENARIO: string = 'scenario';

    static STEP_GIVEN: string = 'given';
    static STEP_WHEN: string = 'when';
    static STEP_THEN: string = 'then';
    static STEP_AND: string = 'and';
    static STEP_AND_GENERIC: string = '*';
    static STEP_BUT: string = 'but';

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

    static all(): Array< string > {
        let set = [];
        for ( let x in Keywords ) {
            if ( 'string' === typeof x ) {
                set.push( x );
            }
        }
        return set;
    }
}