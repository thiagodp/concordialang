import { Location } from './Location';

export interface Node {
    keyword: string;
    location: Location;
}

export interface NamedNode extends Node {
    name: string;
}

export interface ContentNode extends Node {
    content: string;
}