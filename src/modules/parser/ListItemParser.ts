import { NodeParser } from './NodeParser';
import { ListItem } from '../ast/ListItem';
import { ParsingContext } from './ParsingContext';
import { NodeIterator } from './NodeIterator';
import { PropertyParser } from './PropertyParser';
import { UIPropertyParser } from './UIPropertyParser';
import { DatabasePropertyParser } from './DatabasePropertyParser';

/**
 * Parses a ListItem node and decide what node type it will be.
 * 
 * @author Thiago Delgado Pinto
 */
export class ListItemParser implements NodeParser< ListItem > {

    private _propertyParsers: PropertyParser[] = [];

    constructor() {
        this._propertyParsers.push( new UIPropertyParser() );
        this._propertyParsers.push( new DatabasePropertyParser() );
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

        for ( let p of this._propertyParsers ) {
            if ( p.isAccepted( node, it ) ) {
                p.handle( node, context, errors );
            }
        }

        // Stay as a ListItem
        return true;
    }

}