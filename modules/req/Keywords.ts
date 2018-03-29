/**
 * Keywords to identify nodes.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class Keywords {

    // Not available in Gherkin

    static IMPORT: string = 'import';
    static REGEX_BLOCK: string = 'regexBlock';
    static CONSTANT_BLOCK: string = 'constantBlock';
    static IS: string = 'is';
    static VARIANT_BACKGROUND = 'variantBackground';
    static VARIANT: string = 'variant';
    static TEST_CASE: string = 'testCase';
    static UI_ELEMENT: string = 'uiElement';
    static DATABASE: string = 'database';

    static BEFORE_ALL: string = 'beforeAll';
    static AFTER_ALL: string = 'afterAll';
    static BEFORE_FEATURE: string = 'beforeFeature';
    static AFTER_FEATURE: string = 'afterFeature';
    static BEFORE_EACH_SCENARIO: string = 'beforeEachScenario';
    static AFTER_EACH_SCENARIO: string = 'afterEachScenario';

    static TAG_GLOBAL = 'tagGlobal';
    static TAG_FEATURE = 'tagFeature';
    static TAG_SCENARIO = 'tagScenario';
    static TAG_VARIANT = 'tagVariant';
    static TAG_IMPORTANCE = 'tagImportance';
    static TAG_IGNORE = 'tagIgnore';
    static TAG_GENERATED = 'tagGenerated';

    // Also available in Gherkin

    static LANGUAGE: string = 'language';

    static FEATURE: string = 'feature';
    static BACKGROUND: string = 'background';
    static SCENARIO: string = 'scenario';

    static STEP_GIVEN: string = 'stepGiven';
    static STEP_WHEN: string = 'stepWhen';
    static STEP_THEN: string = 'stepThen';
    static STEP_AND: string = 'stepAnd';
    static STEP_OTHERWISE: string = 'stepOtherwise';

    static TABLE: string = 'table';

    // Utilities

    static all(): string[] {
        let set = [];
        for ( let x in Keywords ) {
            if ( 'string' === typeof x ) {
                set.push( x );
            }
        }
        return set;
    }
}