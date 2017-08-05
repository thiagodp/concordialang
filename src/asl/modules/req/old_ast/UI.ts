import { Node } from './Node';

export interface UIElement extends Node {
}

export interface UI extends Node {
    elements: Array< UIElement >;
}