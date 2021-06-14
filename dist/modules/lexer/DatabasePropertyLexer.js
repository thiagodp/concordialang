import { NodeTypes } from '../req/NodeTypes';
import { ListItemLexer } from './ListItemLexer';
/**
 * DatabaseProperty lexer.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabasePropertyLexer extends ListItemLexer {
    constructor() {
        super(NodeTypes.DATABASE_PROPERTY);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.DATABASE_PROPERTY];
    }
}
