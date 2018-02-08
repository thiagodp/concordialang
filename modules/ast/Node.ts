import { Location } from './Location';

/**
 * @author Thiago Delgado Pinto
 */

export interface Node {
    nodeType: string;
    location: Location;
}

export interface HasContent {
    content: string; // Useful content, ignoring symbols and keywords
}

export interface HasName {
    name: string;
}

export interface HasValue {
    value: string;
}

export interface HasItems< T extends Node > {
    items: T[];
}

export interface NamedNode extends Node, HasName {    
}

export interface ValuedNode extends Node, HasValue {
}

export interface ContentNode extends Node, HasContent {
}

export interface NodeWithNameAndValue extends ContentNode, HasName, HasValue {
}