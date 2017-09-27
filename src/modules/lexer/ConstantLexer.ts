import { NodeTypes } from '../req/NodeTypes';
import { NameIsContentLexer } from './NameIsContentLexer';
import { Constant } from '../ast/Constant';
import { Expressions } from '../req/Expressions';
import { Symbols } from '../req/Symbols';

/**
 * Detects a Contant.
 * 
 * @author Thiago Delgado Pinto
 */
export class ConstantLexer extends NameIsContentLexer< Constant > {    

    constructor( words: string[] ) {
        super( words, NodeTypes.CONSTANT, NodeTypes.IS );
    }

    /** @inheritDoc */
    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + Symbols.LIST_ITEM_PREFIX // -
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join( '|' ) + ')' // is
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + Expressions.SOMETHING_INSIDE_QUOTES + '|' + Expressions.A_NUMBER + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            ;
    }    
    
}
    