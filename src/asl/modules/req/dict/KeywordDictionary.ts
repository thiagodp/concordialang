/**
 * Keyword dictionary
 * 
 * @see Keywords
 * 
 * @author Thiago Delgado Pinto
 */
export interface KeywordDictionary { // properties should exist in Keywords

    // Non-Gherkin keywords
    
    import?: Array< string >,
    regex?: Array< string >,
    testcase?: Array< string >,

    // Gherkin keywords

    language?: Array< string >,

    feature?: Array< string >,

    step?: Array< string >,
    stepGiven?: Array< string >,
    stepWhen?: Array< string >,
    stepThen?: Array< string >,
    stepAnd?: Array< string >,
    stepBut?: Array< string >,

    scenario?: Array< string >,
    background?: Array< string >,
    outline?: Array< string >,
    examples?: Array< string >

}