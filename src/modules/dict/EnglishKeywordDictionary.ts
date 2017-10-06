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
    table: string[] = [ 'table' ];    

    // Also available in Gherkin

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature' ];
    scenario: string[] = [ 'scenario' ];

    stepGiven: string[] = [ 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and', 'but' ];
    stepOtherwise: string[] = [ 'otherwise' ];

}