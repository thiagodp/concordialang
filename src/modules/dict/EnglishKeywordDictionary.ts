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
    state: string[] = [ 'state' ];    
    testcase: string[] = [ 'test case' ];

    // Also available in Gherkin

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature' ];
    scenario: string[] = [ 'scenario' ];

    stepGiven: string[] = [ 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and', 'but' ];

}