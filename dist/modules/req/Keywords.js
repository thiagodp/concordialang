"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Keywords to identify nodes.
 *
 * @author Thiago Delgado Pinto
 */
class Keywords {
    // Utilities
    static all() {
        let set = [];
        for (let x in Keywords) {
            if ('string' === typeof x) {
                set.push(x);
            }
        }
        return set;
    }
}
// Not available in Gherkin
Keywords.IMPORT = 'import';
Keywords.REGEX_BLOCK = 'regexBlock';
Keywords.CONSTANT_BLOCK = 'constantBlock';
Keywords.IS = 'is';
Keywords.VARIANT_BACKGROUND = 'variantBackground';
Keywords.VARIANT = 'variant';
Keywords.TEST_CASE = 'testCase';
Keywords.UI_ELEMENT = 'uiElement';
Keywords.DATABASE = 'database';
Keywords.BEFORE_ALL = 'beforeAll';
Keywords.AFTER_ALL = 'afterAll';
Keywords.BEFORE_FEATURE = 'beforeFeature';
Keywords.AFTER_FEATURE = 'afterFeature';
Keywords.BEFORE_EACH_SCENARIO = 'beforeEachScenario';
Keywords.AFTER_EACH_SCENARIO = 'afterEachScenario';
Keywords.TAG_GLOBAL = 'tagGlobal';
Keywords.TAG_FEATURE = 'tagFeature';
Keywords.TAG_SCENARIO = 'tagScenario';
Keywords.TAG_VARIANT = 'tagVariant';
Keywords.TAG_IMPORTANCE = 'tagImportance';
Keywords.TAG_IGNORE = 'tagIgnore';
Keywords.TAG_GENERATED = 'tagGenerated';
// Also available in Gherkin
Keywords.LANGUAGE = 'language';
Keywords.FEATURE = 'feature';
Keywords.BACKGROUND = 'background';
Keywords.SCENARIO = 'scenario';
Keywords.STEP_GIVEN = 'stepGiven';
Keywords.STEP_WHEN = 'stepWhen';
Keywords.STEP_THEN = 'stepThen';
Keywords.STEP_AND = 'stepAnd';
Keywords.STEP_OTHERWISE = 'stepOtherwise';
Keywords.TABLE = 'table';
exports.Keywords = Keywords;
//# sourceMappingURL=Keywords.js.map