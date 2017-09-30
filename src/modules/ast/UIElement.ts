import { HasItems, NamedNode } from './Node';

export interface UIElement extends NamedNode {
    properties: UIProperty[];
}

export interface UIProperty {

    name: 'id'          // value is a string between quotes
        | 'type'        // value is a reserved word
        | 'value'       // value is a number or a string between quotes
        | 'datatype'    // value is a reserved word
        | 'minlength'   // value is a number
        | 'maxlength'   // value is a number
        | 'minvalue'    // value is a number or a string between quotes
        | 'maxvalue'    // value is a number or a string between quotes
        | 'format'      // value is a string between quotes
        ;

    // mais fácil classificar com NLP e checar se os
    // elementos presentes fazem sentido

    valueType: 'value'      // between quotes
        | 'reservedWord'    // no quotes
        | 'query'           // between plics
        | 'computation'     // between plics
        | 'reference'       // no quotes
        ;

    value: string;

    valueOptionType: 'none'
        | 'precision'
        ;

    otherwiseSentences: string[];
}