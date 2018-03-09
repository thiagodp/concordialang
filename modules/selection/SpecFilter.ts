import { ImportBasedGraphBuilder } from "./ImportBasedGraphBuilder";
import { FeatureBasedGraphFilter } from "./FeatureBasedGraphFilter";
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

    /**
     * Returns a graph with all the documents that fullfil the given filters.
     * Filters are processed in order.
     * 
     * @param spec Specification
     * @param filters Filters
     */
    makeFilteredGraph(
        spec: Spec,
        filters: Array< ( doc: Document, graph: Graph ) => boolean > = []
    ): Graph {

        // Build a graph from the documents and its Imports, since it is expected
        // that references to another document's declarations need Imports.
        // Cyclic references are validated previosly, by the ImportSSA.
        let graph: Graph = ( new ImportBasedGraphBuilder() ).buildFrom( spec );

        // Apply filters
        for ( let filter of filters ) {
            graph = this._graphFilter.filter( graph, filter );
        }
        
        return graph;
    }


}
