import { KeywordDictionary } from './KeywordDictionary';

/**
 * English keyword dictionary as the base dictionary.
 * 
 * @author  Thiago Delgado Pinto
 */
export class EnglishKeywordDictionary implements KeywordDictionary {

    // NOTE: If you want to change some attribute name,
    //       please do it in the parent interface.

    // Not available in Gherkin
    
    import: string[] = [ 'import' ];
    regexBlock: string[] = [ 'regexes', 'regular expressions' ];
    constantBlock: string[] = [ 'constants' ];
    is: string[] = [ 'is' ];
    with: string[] = [ "with" ];
    state: string[] = [ 'state' ];    
    variant: string[] = [ 'variant' ];
    template: string[] = [ 'template' ];
    uiElement: string[] = [ 'ui element' ];
    database: string[] = [ 'database' ];

    beforeAll: string[] = [ 'before all' ];
    afterAll: string[] = [ 'after all' ];
    beforeFeature: string[] = [ 'before feature' ];
    afterFeature: string[] = [ 'after feature' ];
    beforeEachScenario: string[] = [ 'before each scenario' ];
    afterEachScenario: string[] = [ 'after each scenario' ];

    // Also available in Gherkin

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature' ];
    scenario: string[] = [ 'scenario' ];

    stepGiven: string[] = [ 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and', 'but' ];
    stepOtherwise: string[] = [ 'otherwise', 'when invalid', 'if invalid' ];

    table: string[] = [ 'table' ];    

}