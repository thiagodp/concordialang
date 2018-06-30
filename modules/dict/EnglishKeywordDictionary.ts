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
    variant: string[] = [ 'variant' ];
    variantBackground: string[] = [ 'variant background' ];
    testCase: string[] = [ 'test case' ];
    uiElement: string[] = [ 'ui element' ];
    database: string[] = [ 'database' ];

    beforeAll: string[] = [ 'before all' ];
    afterAll: string[] = [ 'after all' ];
    beforeFeature: string[] = [ 'before feature' ];
    afterFeature: string[] = [ 'after feature' ];
    beforeEachScenario: string[] = [ 'before each scenario' ];
    afterEachScenario: string[] = [ 'after each scenario' ];

    i: string[] = [ 'i' ];
    is: string[] = [ 'is' ];
    with: string[] = [ "with" ];
    valid: string[] = [ "valid" ];
    invalid: string[] = [ "invalid" ];
    random: string[] = [ "random" ];
    from: string[] = [ "from" ];

    tagGlobal: string[] = [ 'global' ];
    tagFeature: string[] = [ 'feature' ];
    tagScenario: string[] = [ 'scenario' ];
    tagVariant: string[] = [ 'variant' ];
    tagImportance: string[] = [ 'importance' ];
    tagIgnore: string[] = [ 'ignore' ];
    tagGenerated: string[] = [ 'generated' ];

    // Also available in Gherkin

    language: string[] = [ 'language' ];

    feature: string[] = [ 'feature', 'story', 'user story' ];
    background: string[] = [ 'background' ];
    scenario: string[] = [ 'scenario' ];

    stepGiven: string[] = [ 'given that', 'given' ];
    stepWhen: string[] = [ 'when' ];
    stepThen: string[] = [ 'then' ];
    stepAnd: string[] = [ 'and', 'but' ];
    stepOtherwise: string[] = [ 'otherwise', 'when invalid', 'if invalid' ];

    table: string[] = [ 'table' ];

}