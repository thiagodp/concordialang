"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * Feature-based graph filter.
 *
 * @author Thiago Delgado Pinto
 */
class FeatureBasedGraphFilter {
    constructor(_criteria, _matcher) {
        this._criteria = _criteria;
        this._matcher = _matcher;
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
    shouldBeIncluded(doc, graph) {
        // Has a Feature ?
        if (TypeChecking_1.isDefined(doc.feature)) {
            return this._matcher.matches(this._criteria, doc.feature.tags || [], doc.feature.name);
        }
        // A document WITHOUT a Feature should be included whether it dependes on
        // a Feature that should be included.
        // Iterates over all outgoing edges of the `from` vertex
        const fromKey = doc.fileInfo.path;
        let shouldBeIncluded = false;
        for (let [/* toKey */ , vertexValue] of graph.verticesFrom(fromKey)) {
            // Examine the included document (recursively)
            if (this.shouldBeIncluded(vertexValue, graph)) {
                shouldBeIncluded = true;
                break;
            }
        }
        return shouldBeIncluded;
    }
}
exports.FeatureBasedGraphFilter = FeatureBasedGraphFilter;
