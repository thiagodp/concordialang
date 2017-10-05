import { HasItems, NamedNode, ContentNode } from './Node';
import { Step } from './Step';
import { MayHaveTags } from './Tag';

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
export interface UIProperty extends ContentNode {

    property: string;

    values: string[];

    otherwiseSentences: Step[];
}