import { UIProperty } from "../ast/UIElement";
import { NodeTypes } from '../req/NodeTypes';
import { ListItemLexer } from './ListItemLexer';

/**
 * Detects a UIProperty node.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyLexer extends ListItemLexer< UIProperty > {

    constructor() {
        super( NodeTypes.UI_PROPERTY );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.UI_PROPERTY ];
    }

}