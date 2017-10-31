import { KeywordDictionary } from './KeywordDictionary';

/**
 * English keyword dictionary as the base dictionary.
 * 
 * @author  Thiago Delgado Pinto
 */
export class EnglishKeywordDictionary implements KeywordDictionary {

    // Not available in Gherkin
    
    import: string[] = [ 'import' ];
    regexBlock: string[] = [ 'regexes', 'regular expressions' ];
    constantBlock: string[] = [ 'constants' ];
    is: string[] = [ 'is' ];
    state: string[] = [ 'state' ];    
    testcase: string[] = [ 'test case' ];
    uiElement: string[] = [ 'ui element' ];
    database: string[] = [ 'database' ];

    beforeAll: string[] = [ 'before all' ];
    afterAll: string[] = [ 'after all' ];
    beforeFeature: string[] = [ 'before feature' ];
    afterFeature: string[] = [ 'after feature' ];
    beforeScenarios: string[] = [ 'before scenarios', 'before each scenario' ];
    afterScenarios: string[] = [ 'after scenarios', 'after each scenario' ];

    // Also available in Gherkin

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature' ];
    scenario: string[] = [ 'scenario' ];

    stepGiven: string[] = [ 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and', 'but' ];
    stepOtherwise: string[] = [ 'otherwise' ];

    table: string[] = [ 'table' ];    

}