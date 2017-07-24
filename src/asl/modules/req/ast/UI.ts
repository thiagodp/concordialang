import { ASTNode } from './ASTNode';

export interface UIElement extends ASTNode {

}

export interface UI extends ASTNode {
    elements: Array< UIElement >;
}