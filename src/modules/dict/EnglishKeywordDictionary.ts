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
    testcase: string[] = [ 'test case' ];
    state: string[] = [ 'state' ];
    testcaseSentence: string[] = [ 'i' ];

    // Gherkin keywords

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature' ];

    step: string[] = [ 'given', 'when', 'then', 'and', 'but' ];
    stepGiven: string[] = [ 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and' ];
    stepBut: string[] = [ 'but' ];

    scenario: string[] = [ 'scenario' ];
    background: string[] = [ 'background' ];
    outline: string[] = [ 'outline' ];
    examples: string[] = [ 'examples' ];

}