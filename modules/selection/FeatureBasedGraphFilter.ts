import Graph = require('graph.js/dist/graph.full.js');

import { Document } from '../ast/Document';
import { isDefined } from '../util/TypeChecking';
import { CriteriaMatcher } from './CriteriaMatcher';
import { FilterCriterion } from './FilterCriterion';


/**
 * Feature-based graph filter.
 *
 * @author Thiago Delgado Pinto
 */
export class FeatureBasedGraphFilter {

    constructor(
        private _criteria: Map< FilterCriterion, string | number | string[] >,
        private _matcher: CriteriaMatcher
    ) {
    }

    /**
     * Determines whether a Document should be included in the filtering results,
     * based on whether it has a Feature that matches the criteria or whether it
     * has no Feature but it imports a Feature that should be included.
     *
     * @param doc Document to evaluate.
     * @param graph Graph with all the documents.
     * @returns boolean
     */
    shouldBeIncluded(
        doc: Document,
        graph: Graph
    ): boolean {

        // Has a Feature ?
        if ( isDefined( doc.feature ) ) {
            return this._matcher.matches( this._criteria, doc.feature.tags || [], doc.feature.name );
        }

        // A document WITHOUT a Feature should be included whether it dependes on
        // a Feature that should be included.

        // Iterates over all outgoing edges of the `from` vertex
        const fromKey = doc.fileInfo.path;
        let shouldBeIncluded: boolean = false;
        for ( let [ toKey, vertexValue ] of graph.verticesFrom( fromKey ) ) {
            // Examine the included document (recursively)
            if ( this.shouldBeIncluded( vertexValue, graph ) ) {
                shouldBeIncluded = true;
                break;
            }
        }
        return shouldBeIncluded;
    }

}