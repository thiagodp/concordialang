/**
 * Language symbols.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class Symbols {

    // prefixes

    static COMMENT_PREFIX = '//';
    static TAG_PREFIX = '@';
    static LANGUAGE_PREFIX = '#';
    static PY_STRING_PREFIX = '"""';
    static TABLE_PREFIX = '|';

    // separators

    static LANGUAGE_SEPARATOR = ':';
    static TITLE_SEPARATOR = ':';
    static TABLE_CELL_SEPARATOR = '|';
    static IMPORT_SEPARATOR = ',';
    static REGEX_SEPARATOR = ':';
    static TAG_VALUE_SEPARATOR = ',';

    // wrappers

    static IMPORT_WRAPPER = '"';
    static REGEX_WRAPPER = '"';
    static TEST_CASE_WRAPPER = '"';
}