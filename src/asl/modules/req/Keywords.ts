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
    static STEP_AND_GENERIC: string = '*'; // TO-DO: remove
    static STEP_BUT: string = 'but'; // TO-DO: remove and include the words as "and"

    static IMPORT: string = 'import';
    static REGEX: string = 'regex';

    static TEXT: string = 'text'; // not empty, but not recognized

    /**
     * Returns the tokens that are variable, that is, those based on a dictionary.
     */
    static variableTypes(): Array< string > {
        return [
            Keywords.LANGUAGE
            , Keywords.FEATURE
            , Keywords.SCENARIO
            , Keywords.STEP_GIVEN
            , Keywords.STEP_WHEN
            , Keywords.STEP_THEN
            , Keywords.STEP_AND
            , Keywords.STEP_AND_GENERIC
            , Keywords.STEP_BUT
            , Keywords.IMPORT
            , Keywords.REGEX
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