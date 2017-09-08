import { KeywordDictionary } from './KeywordDictionary';

/**
 * English keyword dictionary as the base dictionary.
 * 
 * @author  Thiago Delgado Pinto
 */
export class EnglishKeywordDictionary implements KeywordDictionary {

    // Non-Gherkin keywords
    
    import?: Array< string > = [ 'import' ];
    regex?: Array< string > = [ 'regex' ];
    testcase?: Array< string > = [ 'test case' ];

    // Gherkin keywords

    language?: Array< string > = [ 'language' ];

    feature?: Array< string > = [ 'feature' ];

    step?: Array< string > = [ 'given', 'when', 'then', 'and', 'but' ];
    stepGiven?: Array< string > = [ 'given' ];
    stepWhen?: Array< string > = [ 'when' ];
    stepThen?: Array< string > = [ 'then' ];
    stepAnd?: Array< string > = [ 'and' ];
    stepBut?: Array< string > = [ 'but' ];

    scenario?: Array< string > = [ 'scenario' ];
    background?: Array< string > = [ 'background' ];
    outline?: Array< string > = [ 'outline' ];
    examples?: Array< string > = [ 'examples' ];

}