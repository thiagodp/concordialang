import { KeywordDictionary } from './KeywordDictionary';

/**
 * English keyword dictionary as the base dictionary.
 * 
 * @author  Thiago Delgado Pinto
 */
export class EnglishKeywordDictionary implements KeywordDictionary {

    // Non-Gherkin keywords
    
    import: string[] = [ 'import' ];
    regex: string[] = [ 'regex', 'regular expression' ];
    state: string[] = [ 'state' ];    
    testcase: string[] = [ 'test case' ];

    // Gherkin keywords

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature' ];

    stepGiven: string[] = [ 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and', 'but' ];

    scenario: string[] = [ 'scenario' ];
    background: string[] = [ 'background' ];
    outline: string[] = [ 'outline' ];
    examples: string[] = [ 'examples' ];

}