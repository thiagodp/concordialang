import { NodeTypes } from '../req/NodeTypes';
import { ListItemLexer } from './ListItemLexer';
/**
 * Detects a UIProperty node.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyLexer extends ListItemLexer {
    constructor() {
        super(NodeTypes.UI_PROPERTY);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.UI_PROPERTY];
    }
}
