import { NLPResult } from '../nlp/NLPResult';
import { HasItems, NamedNode } from './Node';
import { Step } from './Step';
import { MayHaveTags } from './Tag';
import { ListItem } from './ListItem';

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

    property: string;

    values: string[];

    nlpResult: NLPResult;

    otherwiseSentences: Step[];
}