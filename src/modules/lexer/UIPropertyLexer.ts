import { ListItemLexer } from './ListItemLexer';
import { NodeTypes } from '../req/NodeTypes';
import { UIProperty } from "../ast/UIElement";

/**
 * Detects a UIProperty node.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIPropertyLexer extends ListItemLexer< UIProperty > {

    constructor() {
        super( NodeTypes.UI_PROPERTY );
    }

}