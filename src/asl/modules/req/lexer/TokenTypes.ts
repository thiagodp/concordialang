/**
 * Token types
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class TokenTypes {
    
    static EOC: string = 'EOC';

    static LANGUAGE: string = 'language';
    static COMMENT: string = 'comment';
    static TAG: string = 'tag';
    static PY_STRING_OP: string = 'py_string_op';

    static STEP: string = 'step';
    static FEATURE: string = 'feature';
    static SCENARIO: string = 'scenario';
    static OUTLINE: string = 'outline';
    static EXAMPLES: string = 'examples';
    static BACKGROUND: string = 'background';

    static TABLE_ROW: string = 'table_row';

    static NEW_LINE: string = 'new_line'; // empty line
    static TEXT: string = 'text'; // non-empty line
}
