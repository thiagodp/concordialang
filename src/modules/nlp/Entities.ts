/**
 * Entities
 * 
 * @author Thiago Delgado Pinto
 */
export enum Entities {

    // General
    VALUE = 'value', // e.g.: "username"
    ELEMENT = 'element', // e.g.: <Username>
    NUMBER = 'number', // e.g.: -3.12
    SCRIPT = 'script', // e.g.: 'SELECT * FROM someTable'

    // Test Case
    UI_ACTION = 'ui_action', // e.g.: click, fill, ...
    UI_ACTION_MODIFIER = 'ui_action_modifier', // e.g.: not    
    UI_ACTION_OPTION = 'ui_action_option', // e.g.: inside, up, down, ...
    UI_ELEMENT_TYPE = 'ui_element_type', // e.g.: button, select, ...

    // UI
    UI_PROPERTY = 'ui_property', // e.g.: id, value, ...
    UI_VERB = 'ui_verb', // e.g.: is, queried, ...
    UI_DATA_TYPE = 'ui_data_type' // e.g.: string, integer, ...
}