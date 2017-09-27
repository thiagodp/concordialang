import { Location } from './Location';

export interface Node {
    keyword: string;
    location: Location;
}

export interface HasName {
    name: string;
}

export interface HasContent {
    content: string;
}

export interface NamedNode extends Node, HasName {    
}

export interface ContentNode extends Node, HasContent {
}

export interface NodeWithNameAndContent extends Node, HasName, HasContent {
}