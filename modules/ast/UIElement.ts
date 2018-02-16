import { NLPResult } from '../nlp/NLPResult';
import { HasItems, NamedNode } from './Node';
import { Step } from './Step';
import { MayHaveTags } from './Tag';
import { ListItem } from './ListItem';
import { Table } from './Table';
import { Constant } from './Constant';
import { Database } from './Database';

/**
 * UI element node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface UIElement extends NamedNode, MayHaveTags {
    items: UIProperty[];
}

/**
 * UI property node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface UIProperty extends ListItem {

    otherwiseSentences: Step[];

    //
    // Recognized after NLP
    //

    nlpResult: NLPResult; // Raw NLP result

    property: string; // UI Property, e.g., min value comes from "SELECT ..." --> minvalue

    valueTarget: UIValueTarget; // Target, e.g., min value comes from "SELECT ..." --> query

    values: UIValue[];
}

/**
 * UI value target.
 * 
 *     UIValueTarget | expected value type | values' length
 *     --------------|---------------------|---------------
 *     VALUE         | string | number     | 1
 *     VALUE_LIST    | any[]               | 1+
 *     ELEMENT_REF   | string              | 1
 *     REGEX         | string              | 1
 *     QUERY         | string              | 1+
 *     COMPUTATION   | string              | 1+  
 * 
 * @author Thiago Delgado Pinto
 */
export enum UIValueTarget {
    VALUE = 'value',
    VALUE_LIST = 'value_list',
    ELEMENT_REF = 'element', // Refers to another UI element
    REGEX = 'regex',
    QUERY = 'query',
    COMPUTATION = 'computation'	
}

export enum UIValueReferenceType {
    NONE = 'none',
    DATABASE = 'database',
    TABLE = 'table',
    DATABASE_AND_TABLE = 'database_and_table',
    ELEMENT = 'element',
    CONSTANT = 'constant'
}

export class UIValue {
    constructor(
        public content: any[] = [],
        public refType: UIValueReferenceType = UIValueReferenceType.NONE,
        public ref?: Database | Table | UIElement | Constant
    ) {
    }
}