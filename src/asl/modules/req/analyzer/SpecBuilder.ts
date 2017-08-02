import { Node } from '../ast/Node';
import { Spec } from '../ast/Spec';
import { Document } from '../ast/Document';
import { LocatedException } from '../LocatedException';
import { Keywords } from '../Keywords';
import { AnalyzerMapBuilder } from './AnalyzerMapBuilder';
import { FeatureAnalyzer } from './FeatureAnalyzer';
import { ImportAnalyzer } from './ImportAnalyzer';
import { NodeAnalyzer } from './NodeAnalyzer';
import { ScenarioAnalyzer } from './ScenarioAnalyzer';

/**
 * Builds a Spec from an array of Document.
 */
export class SpecBuilder {

    private _analyzersMap: {};

    public constructor() {
        this._analyzersMap = ( new AnalyzerMapBuilder() ).build();
    }

    /**
     * Always return an Spec, even if incomplete because of errors.
     * 
     * @param documents Documents to analyze.
     * @param errors Errors
     * @param stopOnTheFirstError Stop on the first error?
     */
    public build(
        documents: Array< Document >,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): Spec {
        let spec: Spec = { documents: [] };
        let analyzer: NodeAnalyzer< Node >;
        for ( let doc of documents ) {
            // Imports
            this.analyzeItems( Keywords.IMPORT, doc.imports, spec, errors, stopOnTheFirstError );
            // Features
            this.analyzeItems( Keywords.FEATURE, doc.features, spec, errors, stopOnTheFirstError );

            // Finally check for errors
            if ( stopOnTheFirstError && errors.length > 0 ) {
                break;
            }            
        }
        return spec;
    }


    private analyzeItems< T extends Node >(
        keyword: string,
        items: Array< T >,
        spec: Spec,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): void {
        // Just to avoid to call it repeatedly
        if ( stopOnTheFirstError && errors.length > 0 ) {
            return;
        }
        let analyzer: NodeAnalyzer< T > = this.analyzerWith( keyword );
        let i, node;
        for ( i in items ) {
            node = items[ i ];
            analyzer.analyzeDocuments( node, spec, errors, stopOnTheFirstError );
            if ( stopOnTheFirstError && errors.length > 0 ) {
                break;
            }
        }
    }
    
    private analyzerWith( keyword: string ): NodeAnalyzer< Node > {
        let analyzer = this._analyzersMap[ keyword ];
        if ( ! analyzer ) {
            throw new Error( 'Analyzer unavailable for a node with the keyword "' + keyword + '".' );
        }        
        return analyzer;
    }    

}