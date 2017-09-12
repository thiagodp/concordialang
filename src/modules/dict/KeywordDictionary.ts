/**
 * Keyword dictionary
 * 
 * @see Keywords
 * 
 * @author Thiago Delgado Pinto
 */
export interface KeywordDictionary { // properties should exist in Keywords

    // Non-Gherkin keywords
    
    import: string[],
    regex: string[],
    state: string[],
    testcase: string[],    
    testcaseSentence: string[],

    // Gherkin keywords

    language: string[],

    feature: string[],

    step: string[],
    stepGiven: string[],
    stepWhen: string[],
    stepThen: string[],
    stepAnd: string[],
    stepBut: string[],

    scenario: string[],
    background: string[],
    outline: string[],
    examples: string[]

}