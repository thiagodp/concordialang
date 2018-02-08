/**
 * Entities for NLP
 * 
 * @author Thiago Delgado Pinto
 * 
 * @see Intents
 */
export enum Entities {

    // General
    VALUE = 'value', // e.g., "username"
    ELEMENT = 'element', // e.g., {Username}, {My Feature 1:Full Name}
    NUMBER = 'number', // e.g., -3.12
    QUERY = 'query', // e.g., "SELECT * FROM someTable"
    CONSTANT = 'constant', // e.g., [hello]

    // Intent "testcase"
    UI_ACTION = 'ui_action', // e.g.: click, fill, ...
    UI_ACTION_MODIFIER = 'ui_action_modifier', // e.g.: not    
    UI_ACTION_OPTION = 'ui_action_option', // e.g.: inside, up, down, ...
    UI_ELEMENT_TYPE = 'ui_element_type', // e.g.: button, select, ...

    // Intent "ui"
    UI_PROPERTY = 'ui_property', // e.g.: id, value, ...
    UI_CONNECTOR = 'ui_connector', // e.g.: is, queried, ...
    UI_DATA_TYPE = 'ui_data_type', // e.g.: string, integer, ...

    // Intent "datasource"
    DS_PROPERTY = 'ds_property' // e.g.: host, port, ...
}