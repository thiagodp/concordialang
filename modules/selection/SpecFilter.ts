import { ImportBasedGraphBuilder } from "./ImportBasedGraphBuilder";
import { FilterCriterion } from "./FilterCriterion";
import { GraphFilter, GraphFilterEvent } from "./GraphFilter";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Specification filter
 *
 * @author Thiago Delgado Pinto
 */
export class SpecFilter {

    private readonly _graphFilter = new GraphFilter();
    private _graph: Graph = null;

    constructor( private _spec: Spec ) {
    }

    filter( fn: ( doc: Document, graph: Graph ) => boolean ): SpecFilter {

        // Adds a listener for excluded documents, in order to remove them from the specification
        this._graphFilter.addListener(
            GraphFilterEvent.DOCUMENT_NOT_INCLUDED,
            this.removeDocumentFromSpecification
        );

        // Overwrites the current graph with the filtered one
        this._graph = this._graphFilter.filter( this.graph(), fn );

        // Removes listeners
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
        this._graph = this.createGraph();
        return this;
    }

    private createGraph() {
        // Build a graph from the documents and its Imports, since it is expected
        // that references to another document's declarations need Imports.
        // Cyclic references are validated previosly, by the ImportSSA.
        return ( new ImportBasedGraphBuilder() ).buildFrom( this._spec );
    }

    private removeDocumentFromSpecification( doc: Document ) {
        const pos = this._spec.docs.indexOf( doc );
        if ( pos >= 0 ) {
            this._spec.docs.splice( pos, 1 );
        }
    }

}
