import Graph from 'graph.js';
import { ReservedTags } from '../req/ReservedTags';
import { Document } from '../ast/Document';
import { isDefined, isString } from '../util/TypeChecking';
import { Tag } from '../ast/Tag';
import { isNumber } from '../util/TypeChecking';
import { Feature } from '../ast/Feature';
import { Defaults } from '../app/Defaults';

export enum FilterCriterion {

    // GTE = Greater Than or Equal to
    // LTE = Less Than or Equal to
    // EQ  = Equal to
    // NEQ = Not Equal to

    IMPORTANCE_GTE = 'importance_gte',
    IMPORTANCE_LTE = 'importance_lte',
    IMPORTANCE_EQ = 'importance_eq',

    TAG_EQ = 'tag_eq',
    TAG_NEQ = 'tag_neq',

    NAME_EQ = 'name_eq',
    NAME_STARTING_WITH = 'name_starting_with',
    NAME_ENDING_WITH = 'name_ending_with',
    NAME_CONTAINING = 'name_containing'
}

export class FeatureBasedGraphFilter {

    private readonly _defaultImportance: number = ( new Defaults() ).IMPORTANCE;

    constructor(
        private _ignoreKeywords: string[] = [ ReservedTags.IGNORE ],
        private _importanceKeywords: string[] = [ ReservedTags.IMPORTANCE ]
    ) {
    }

    /**
     * Creates a new graph containing the documents whose features match 
     * the given criteria. Features' dependencies are also included.
     * 
     * Features with "@ignore" are ignored by default.
     * 
     * @param graph Original specification graph.
     * @param criteria Criteria used to filter the graph.
     * @returns A new graph.
     */
    filter(
        graph: Graph,
        criteria: Map< FilterCriterion, string | number >
    ): Graph {

        // No criteria ? -> Return the given graph
        if ( 0 === criteria.size ) {
            return graph;
        }

        let filteredGraph = new Graph();

        // Iterate in topological order
        for ( let [ key, value ] of graph.vertices_topologically() ) {

            const doc: Document = value as Document;
            if ( ! this.shouldAppearInResults( doc, graph, criteria ) ) {
                continue;
            }

            // Use the file path as the key
            const fromKey = doc.fileInfo.path;

            // Add the document as a vertex. If the key already exists, the value is overwriten.
            filteredGraph.addVertex( fromKey, doc ); // key, value
            
            // Add edges that leaves the document
            // This iterates over all outgoing edges of the `from` vertex
            for ( let [ toKey, vertexValue ] of graph.verticesFrom( fromKey ) ) {
                filteredGraph.ensureVertex( toKey, vertexValue );
                filteredGraph.ensureEdge( fromKey, toKey );
            }
        }
        return filteredGraph;
    }

    /**
     * Determines whether a document should be included in the filter results.
     * 
     * @param doc Document to evaluate.
     * @param graph Graph with all the documents.
     * @param criteria Filtering criteria.
     * @returns boolean
     */
    shouldAppearInResults(
        doc: Document,        
        graph: Graph,
        criteria: Map< FilterCriterion, string | number >
    ): boolean {

        // Doc has Feature ? -> See whether its Tags
        if ( isDefined( doc.feature ) ) {
            if ( isDefined( doc.feature.tags ) ) {
                return this.matchCriteria( criteria, doc.feature.tags, doc.feature.name );
            }
            return true; // has feature with no tags, include it
        }

        // Iterates over all outgoing edges of the `from` vertex
        const fromKey = doc.fileInfo.path;
        let shouldBeIncluded: boolean = false;
        for ( let [ toKey, vertexValue ] of graph.verticesFrom( fromKey ) ) {
            // Examine the included document (recursively)
            if ( this.shouldAppearInResults( vertexValue, graph, criteria ) ) {
                shouldBeIncluded = true;
                break;
            }
        }
        return shouldBeIncluded;
    }

    /**
     * Returns true whether the given criteria are match.
     * 
     * @param criteria Criteria to be applied.
     * @param tags Node tags.
     * @param name Node name.
     */
    matchCriteria(
        criteria: Map< FilterCriterion, string | number >,
        tags: Tag[],
        name: string
    ): boolean {

        // No filter ? Matches.
        if ( 0 === criteria.size ) {
            return true;
        }

        // Has @ignore tag ? Do NOT match.
        if ( this.containsIgnoreTag( tags ) ) {
            return false;
        }

        let tagImportanceValue: number | null = this.importanceValue( tags );
        // No importance tag ? Assumes a default value.
        if ( null === tagImportanceValue ) {
            tagImportanceValue = this._defaultImportance;
        }

        for ( let [ criterion, value ] of criteria ) {

            // Importance
            const isAboutImportance: boolean = 0 === criterion.toString().indexOf( 'importance' );
            if ( isAboutImportance ) {
                const val: number = isString( value ) ? parseInt( value.toString() ) : Number( value );
                if ( FilterCriterion.IMPORTANCE_GTE === criterion ) {
                    return tagImportanceValue >= val;
                }
                if ( FilterCriterion.IMPORTANCE_LTE === criterion ) {
                    return tagImportanceValue <= val;
                }
                if ( FilterCriterion.IMPORTANCE_EQ === criterion ) {
                    return tagImportanceValue === val;
                }
            }

            // Tag
            if ( FilterCriterion.TAG_EQ === criterion ) {
                return this.tagsWithKeyword( tags, [ value.toString() ] ).length > 0;
            }
            if ( FilterCriterion.TAG_NEQ === criterion ) {
                return 0 === this.tagsWithKeyword( tags, [ value.toString() ] ).length;
            }

            // Name
            if ( FilterCriterion.NAME_EQ === criterion ) {
                return name.toLowerCase() === value.toString().toLowerCase();
            }
            if ( FilterCriterion.NAME_STARTING_WITH === criterion ) {
                return name.toLowerCase().startsWith( value.toString().toLowerCase() );
            }
            if ( FilterCriterion.NAME_ENDING_WITH === criterion ) {
                return name.toLowerCase().endsWith( value.toString().toLowerCase() );
            }
            if ( FilterCriterion.NAME_CONTAINING === criterion ) {
                return name.toLowerCase().indexOf( value.toString().toLowerCase() ) >= 0;
            }            
        }

        return false;
    }

    hasTagAKeyword( tag: Tag, keywords: string[] ): boolean {
        return keywords.indexOf( tag.name.toLowerCase() ) >= 0;
    }    

    tagsWithKeyword( tags: Tag[], keywords: string[] ) {
        return tags.filter( ( t: Tag ) => this.hasTagAKeyword( t, keywords ) );
    }

    containsIgnoreTag( tags: Tag[] ): boolean {
        return this.tagsWithKeyword( tags, this._ignoreKeywords ).length > 0;
    }

    importanceValue( tags: Tag[] ): number | null {
        let filtered = this.tagsWithKeyword( tags, this._importanceKeywords );
        return ( filtered.length > 0 ) ? parseInt( filtered[ 0 ].content ) : null;
    }

}