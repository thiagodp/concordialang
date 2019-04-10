import { UIProperty } from "concordialang-types";
import { ListItemLexer } from './ListItemLexer';
import { NodeTypes } from '../req/NodeTypes';

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