/**
 * Keywords to identify nodes.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class Keywords {

    // Not available in Gherkin
  
    static IMPORT: string = 'import';
    static REGEX_BLOCK: string = 'regexBlock';
    static STATE: string = 'state';    
    static TEST_CASE: string = 'testcase';
    
    // Also available in Gherkin

    static LANGUAGE: string = 'language';

    static FEATURE: string = 'feature';
    static SCENARIO: string = 'scenario';

    static STEP_GIVEN: string = 'stepGiven';
    static STEP_WHEN: string = 'stepWhen';
    static STEP_THEN: string = 'stepThen';
    static STEP_AND: string = 'stepAnd';

    // Utilities

    static all(): string[] {
        let set = [];
        for ( let x in Keywords ) {
            if ( 'string' === typeof x ) {
                set.push( x );
            }
        }
        return set;
    }
}