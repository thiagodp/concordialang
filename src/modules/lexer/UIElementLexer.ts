import { NamedNodeLexer } from "./NamedNodeLexer";
import { NodeTypes } from "../req/NodeTypes";
import { UIElement } from "../ast/UIElement";

/**
 * Detects a UI Element.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIElementLexer extends NamedNodeLexer< UIElement > {

    constructor( words: Array< string > ) {
        super( words, NodeTypes.UI_ELEMENT );
    }

}