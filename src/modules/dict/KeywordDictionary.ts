/**
 * Keyword dictionary
 * 
 * @author Thiago Delgado Pinto
 */
export interface KeywordDictionary { // properties should exist in Keywords

    // Not available in Gherkin
    
    import: string[],
    regexBlock: string[],
    state: string[],
    testcase: string[],

    // Also available in Gherkin

    language: string[],

    feature: string[],
    scenario: string[],

    stepGiven: string[],
    stepWhen: string[],
    stepThen: string[],
    stepAnd: string[]

}