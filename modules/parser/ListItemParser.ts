import { ListItem } from 'concordialang-types/ast';
import { RegexParser } from './RegexParser';
import { ConstantParser } from './ConstantParser';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { NodeIterator } from './NodeIterator';
import { ListItemNodeParser } from './ListItemNodeParser';
import { UIPropertyParser } from './UIPropertyParser';
import { DatabasePropertyParser } from './DatabasePropertyParser';

/**
 * Parses a ListItem node and decide what node type it will be.
 *
 * @author Thiago Delgado Pinto
 */
export class ListItemParser implements NodeParser< ListItem > {

    private _nodeParsers: ListItemNodeParser[] = [];

    constructor() {
        this._nodeParsers.push( new ConstantParser() );
        this._nodeParsers.push( new RegexParser() );
        this._nodeParsers.push( new UIPropertyParser() );
        this._nodeParsers.push( new DatabasePropertyParser() );
    }

    analyze(
        node: ListItem,
        context: ParsingContext,
        it: NodeIterator,
        errors: Error[]
    ): boolean {

        if ( ! it.hasPrior() ) {
            return false; // Nothing to do here
        }

        for ( let p of this._nodeParsers ) {
            if ( p.isAccepted( node, it ) ) {
                p.handle( node, context, errors );
            }
        }

        // Stay as a ListItem
        return true;
    }

}