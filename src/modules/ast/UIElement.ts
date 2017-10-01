import { HasItems, NamedNode, Node } from './Node';
import { Step } from './Step';

/**
 * UI element node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface UIElement extends NamedNode {
    properties: UIElementItem[];
}

/**
 * UI element item node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface UIElementItem extends Node {

    property: 'id'      // value is a string between quotes
        | 'type'        // value is a reserved word
        | 'value'       // value is a number or a string between quotes
        | 'datatype'    // value is a reserved word
        | 'minlength'   // value is a number
        | 'maxlength'   // value is a number
        | 'minvalue'    // value is a number or a string between quotes
        | 'maxvalue'    // value is a number or a string between quotes
        | 'format'      // value is a string between quotes
        ;

    value: string;

    otherwiseSentences: Step[];
}