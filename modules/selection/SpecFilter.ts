import { ImportBasedGraphBuilder } from "./ImportBasedGraphBuilder";
import { FilterCriterion } from "./FilterCriterion";
import { GraphFilter } from "./GraphFilter";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import Graph from 'graph.js';

/**
 * Specification filter
 * 
 * @author Thiago Delgado Pinto 
 */
export class SpecFilter {

    private readonly _graphFilter = new GraphFilter();
    private _graph: Graph = null;

    constructor( private _spec: Spec ) {
        this.buildGraph();
    }

    filter( fn: ( doc: Document, graph: Graph ) => boolean ): SpecFilter {
        this._graph = this._graphFilter.filter( this._graph, fn );
        return this;
    }

    get graph(): Graph {
        return this._graph;
    }


    reset(): SpecFilter {
        this.buildGraph();
        return this;
    }

    private buildGraph() {
        // Build a graph from the documents and its Imports, since it is expected
        // that references to another document's declarations need Imports.
        // Cyclic references are validated previosly, by the ImportSSA.
        this._graph = ( new ImportBasedGraphBuilder() ).buildFrom( this._spec );
    }

}
