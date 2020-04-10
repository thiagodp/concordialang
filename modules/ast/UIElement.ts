import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { UIElementInfo, UIProperty } from './UIProperty';

/**
 * UI element node.
 *
 * @author Thiago Delgado Pinto
 */
export interface UIElement extends NamedNode, MayHaveTags {
    items: UIProperty[];
    info?: UIElementInfo; // information added during the semantic analysis
}