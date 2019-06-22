import { UIElement } from "../ast/UIElement";
import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";

/**
 * Detects a UI Element.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementLexer extends NamedNodeLexer< UIElement > {

    constructor( words: Array< string > ) {
        super( words, NodeTypes.UI_ELEMENT );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.UI_PROPERTY ];
    }

}