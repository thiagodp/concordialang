/**
 * Entities for NLP
 *
 * @author Thiago Delgado Pinto
 *
 * @see Intents
 */
export enum Entities {

    //
    // REMEMBER: On update any of these values, update SyntaxRules and language files as well.
    //

    // Value entities (no specific intent)
    VALUE = 'value', //                                 e.g., "username"
    NUMBER = 'number', //                               e.g., -3.12
    UI_ELEMENT_REF = 'ui_element', //                   e.g., {Username}, {My Feature 1:Full Name}
    UI_LITERAL = 'ui_literal', //                       e.g., <id> or <#id> or <@name> or <//xpath> or <~mobilename>
    UI_PROPERTY_REF = 'ui_property_ref', //             e.g., {Name|minlength}, {My Feature 1:Full Name|value}
    QUERY = 'query', //                                 e.g., "SELECT * FROM someTable"
    CONSTANT = 'constant', //                           e.g., [hello]
    VALUE_LIST = 'value_list', //                       e.g., [ 1, "hello", 2 ]
    STATE = 'state', //                                 e.g., ~some state~
    COMMAND = 'command', //                             e.g., 'DELETE FROM table'

    DATE = 'date', //                                   e.g., today or "2020/12/31" or 12/31/2020
    TIME = 'time', //                                   e.g., expression or HH:mm
    LONG_TIME = 'longtime', //                          e.g., expression or HH:mm:ss
    DATE_TIME = 'datetime', //                           e.g., expression or yyyy/MM/dd
    LONG_DATE_TIME = 'longdatetime', //                  e.g., expression or yyyy/MM/dd


    // from the intent "testcase"
    //UI_PROPERTY = 'ui_property', //                   e.g.: text, value, color, ...
    UI_ACTION = 'ui_action', //                         e.g.: click, fill, ...
    UI_ACTION_MODIFIER = 'ui_action_modifier', //       e.g.: not
    UI_ACTION_OPTION = 'ui_action_option', //           e.g.: inside, up, down, ...
    UI_ELEMENT_TYPE = 'ui_element_type', //             e.g.: button, select, ...
    EXEC_ACTION = 'exec_action', //                     e.g.: executes

    // from the intent "ui"
    UI_PROPERTY = 'ui_property', //                     e.g.: id, value, ...
    UI_CONNECTOR = 'ui_connector', //                   e.g.: is, queried, ...
    UI_CONNECTOR_MODIFIER = 'ui_connector_modifier', // e.g.: not
    UI_DATA_TYPE = 'ui_data_type', //                   e.g.: string, integer, ...
    BOOL_VALUE = 'bool_value', //                       e.g.: true, false, ...

    // from the intent "database"
    DB_PROPERTY = 'db_property' //                      e.g.: host, port, ...
}
