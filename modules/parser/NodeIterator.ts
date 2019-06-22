import { Node } from '../ast/Node';

/**
 * Node iterator.
 *
 * @author Thiago Delgado Pinto
 */
export class NodeIterator {

    public constructor( private _nodes: Node[], private _index: number = -1 ) {
    }

    public first(): void {
        this._index = -1;
    }

    public hasCurrent(): boolean {
        return this._index >= 0 && this._index < this._nodes.length;
    }

    public current(): Node {
        if ( ! this.hasCurrent() ) {
            return null;
        }
        return this._nodes[ this._index ];
    }

    public hasNext(): boolean {
        return ( this._index + 1 ) < this._nodes.length;
    }

    public next(): Node | null {
        if ( ! this.hasNext() ) {
            return null;
        }
        return this._nodes[ ++this._index ];
    }

    public spyNext(): Node | null {
        if ( ! this.hasNext() ) {
            return null;
        }
        return this._nodes[ this._index + 1 ]; // it does not change the index !
    }

    public hasPrior(): boolean {
        return this._index > 0;
    }

    public prior(): Node | null {
        if ( ! this.hasPrior() ) {
            return null;
        }
        return this._nodes[ --this._index ];
    }

    public spyPrior(): Node | null {
        if ( ! this.hasPrior() ) {
            return null;
        }
        return this._nodes[ this._index - 1 ]; // it does not change the index !
    }

    public clone(): NodeIterator {
        return new NodeIterator( this._nodes, this._index );
    }

    public nodes( newNodes?: Node[] ): Node[] {
        if ( newNodes ) {
            this._nodes = newNodes;
            this.first();
        }
        return this._nodes;
    }

}