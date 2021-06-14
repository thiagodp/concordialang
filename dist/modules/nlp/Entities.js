/**
 * Entities for NLP
 *
 * @author Thiago Delgado Pinto
 *
 * @see Intents
 */
export var Entities;
(function (Entities) {
    //
    // REMEMBER: On update any of these values, update SyntaxRules and .json files as well.
    //
    // Value entities (no specific intent)
    Entities["VALUE"] = "value";
    Entities["NUMBER"] = "number";
    Entities["UI_ELEMENT_REF"] = "ui_element";
    Entities["UI_LITERAL"] = "ui_literal";
    Entities["UI_PROPERTY_REF"] = "ui_property_ref";
    Entities["QUERY"] = "query";
    Entities["CONSTANT"] = "constant";
    Entities["VALUE_LIST"] = "value_list";
    Entities["STATE"] = "state";
    Entities["COMMAND"] = "command";
    Entities["DATE"] = "date";
    Entities["TIME"] = "time";
    Entities["LONG_TIME"] = "longtime";
    Entities["DATE_TIME"] = "datetime";
    Entities["LONG_DATE_TIME"] = "longdatetime";
    // from the intent "testcase"
    //UI_PROPERTY = 'ui_property', //                   e.g.: text, value, color, ...
    Entities["UI_ACTION"] = "ui_action";
    Entities["UI_ACTION_MODIFIER"] = "ui_action_modifier";
    Entities["UI_ACTION_OPTION"] = "ui_action_option";
    Entities["UI_ELEMENT_TYPE"] = "ui_element_type";
    Entities["EXEC_ACTION"] = "exec_action";
    // from the intent "ui"
    Entities["UI_PROPERTY"] = "ui_property";
    Entities["UI_CONNECTOR"] = "ui_connector";
    Entities["UI_CONNECTOR_MODIFIER"] = "ui_connector_modifier";
    Entities["UI_DATA_TYPE"] = "ui_data_type";
    Entities["BOOL_VALUE"] = "bool_value";
    // from the intent "database"
    Entities["DB_PROPERTY"] = "db_property"; //                      e.g.: host, port, ...
})(Entities || (Entities = {}));
