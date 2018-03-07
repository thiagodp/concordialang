import { FeatureBasedGraphFilter, FilterCriterion } from "./FeatureBasedGraphFilter";
import { Spec } from "../ast/Spec";
import { ImportBasedGraphBuilder } from "./ImportBasedGraphBuilder";
import Graph from 'graph.js';

/**
 * Specification filter
 * 
 * @author Thiago Delgado Pinto 
 */
export class SpecFilter {

    constructor(
        private _featureFilter: FeatureBasedGraphFilter        
    ) {
    }

    /**
     * Returns a graph with all the documents that fullfil the given criteria.
     * 
     * @param spec Specification
     * @param featureCriteria Maps a criterion to a value.
     */
    makeFilteredGraph(
        spec: Spec,
        featureCriteria: Map< FilterCriterion, string | number >
    ): Graph {

        // Build a graph from the documents and its Imports, since it is expected
        // that references to another document's declarations need Imports.
        // Cyclic references are validated previosly, by the ImportSSA.
        let graph: Graph = ( new ImportBasedGraphBuilder() ).buildFrom( spec );

        // Apply filters by feature
        graph = this._featureFilter.filter( graph, featureCriteria );        

        return graph;
    }


}
