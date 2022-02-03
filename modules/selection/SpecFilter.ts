import { EventEmitter } from 'events';
import Graph from 'graph.js/dist/graph.full.js';

import { Document } from '../ast/Document';
import { ImportBasedGraphBuilder } from '../compiler/ImportBasedGraphBuilder';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { GraphFilter, GraphFilterEvent } from './GraphFilter';


/**
 * Specification filter
 *
 * @author Thiago Delgado Pinto
 */
export class SpecFilter extends EventEmitter {

    private readonly _graphFilter = new GraphFilter();
    private _graph: Graph = null;

    constructor( private _spec: AugmentedSpec ) {
        super();
    }


    filter( fn: ( doc: Document, graph: Graph ) => boolean ): SpecFilter {

        // Adds a listener for excluded documents, in order to remove them from the specification
        this._graphFilter.addListener(
            GraphFilterEvent.DOCUMENT_NOT_INCLUDED,
            ( doc ) => {
                this.emit( GraphFilterEvent.DOCUMENT_NOT_INCLUDED );
                this.removeDocumentFromSpecification( doc );
            }
        );

        // Overwrites the current graph with the filtered one
        this._graph = this._graphFilter.filter( this.graph(), fn );

        // Removes listeners from the graph filter
        this._graphFilter.removeAllListeners();

        // Clear specification cache
        this._spec.clearCache();

        return this;
    }

    graph(): Graph {
        if ( ! this._graph ) {
            this._graph = this.createGraph();
        }
        return this._graph;
    }

    reset(): SpecFilter {
        this.removeAllListeners();
        this._graph = this.createGraph();
        return this;
    }

    private createGraph() {
        // Build a graph from the documents and its Imports, since it is expected
        // that references to another document's declarations need Imports.
        // Cyclic references are validated previously, by the ImportSSA.
        return ( new ImportBasedGraphBuilder() ).buildFrom( this._spec );
    }

    private removeDocumentFromSpecification( doc: Document ) {
        const pos = this._spec.docs.indexOf( doc );
        if ( pos >= 0 ) {
            this._spec.docs.splice( pos, 1 );
        }
    }

}
