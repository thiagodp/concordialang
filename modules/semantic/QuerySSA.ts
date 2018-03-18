import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';
import { Warning } from '../req/Warning';
import { ConnectionChecker } from '../db/ConnectionChecker';
import { UIElement, UIProperty } from '../ast/UIElement';
import { Feature } from '../ast/Feature';
import { Entities } from '../nlp/Entities';
import { QueryParser } from '../db/QueryParser';
import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Executes semantic analysis of Queries in a specification.
 *
 * Checkings - and updates, if configured so:
 * - referenced databases
 * - referenced tables
 * - referenced UI elements and features
 * - referenced constants
 *
 * @author Thiago Delgado Pinto
 */
export class QuerySSA extends SpecificationAnalyzer {

    private readonly _queryParser = new QueryParser();

    private _symbolsMap = {
        databaseNameToNameMap: {},
        tableNameToNameMap: {},
        fieldNameToValueMap: {},
        constantNameToValueMap: {}
    };

    constructor( private _adjustDocWithReferences: boolean = false ) {
        super();
    }

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {

        // Iterates the original graph in topological order
        for ( let [ key, value ] of graph.vertices_topologically() ) {

            let doc: Document = value as Document;

            // TO-DO: (future) check global UI elements, i.e., doc.uiElements,
            // and references to them.

            // UI elements may have queries that reference the specification.
            // So, whether no UI elements exist in the document, ignores it.
            if ( ! doc.feature || ! doc.feature.uiElements || doc.feature.uiElements.length < 1 ) {
                continue; // Just check local ui elements
            }

            this.analyzeQueriesOfUIElements(
                doc.feature.uiElements,
                spec,
                doc.feature, // current feature
                errors
            );
        }
    }


    /**
     * Analyze queries of the given UI elements.
     *
     * @param uiElements UI elements to check.
     * @param spec Specification.
     * @param currentFeature Current feature.
     * @param errors Where to include the errors found.
     */
    public analyzeQueriesOfUIElements(
        uiElements: UIElement[],
        spec: Spec,
        currentFeature: Feature,
        errors: SemanticException[]
    ): void {
        for ( let uie of uiElements ) {
            // No items (properties) ?
            if ( ! uie.items || uie.items.length < 1 ) {
                continue;
            }
            for ( let item of uie.items ) {
                // No entities?
                if ( ! item.nlpResult || ! item.nlpResult.entities || item.nlpResult.entities.length < 0 ) {
                    continue;
                }
                // Analyse NLP entities
                for ( let e of item.nlpResult.entities ) {
                    // No query?
                    if ( e.entity != Entities.QUERY ) {
                        continue;
                    }
                    // Checks the query
                    this.analyzeQuery( e.value, item, spec, currentFeature, errors );
                }
            }
        }
    }


    /**
     * Analyze references of a given query.
     *
     * @param query Query to check.
     * @param queryOwner UI property of a UI element that contains the query.
     * @param spec Specification to check.
     * @param currentFeature Current feature.
     * @param errors Where to include the errors found.
     */
    public analyzeQuery(
        query: string,
        queryOwner: UIProperty,
        spec: Spec,
        currentFeature: Feature,
        errors: SemanticException[]
    ): void {

    }

}