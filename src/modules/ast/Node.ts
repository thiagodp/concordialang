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

export interface HasItems< T extends Node > {
    items: T[];
}

export interface NamedNode extends Node, HasName {    
}

export interface ContentNode extends Node, HasContent {
}

export interface NodeWithNameAndContent extends Node, HasName, HasContent {
}