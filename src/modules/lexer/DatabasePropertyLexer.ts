import { NodeTypes } from '../req/NodeTypes';
import { DatabaseProperty } from '../ast/Database';
import { ListItemLexer } from './ListItemLexer';

/**
 * DatabaseProperty lexer.
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabasePropertyLexer extends ListItemLexer< DatabaseProperty > {

    constructor() {
        super( NodeTypes.DATABASE_PROPERTY );
    }

}