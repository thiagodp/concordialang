import { Node } from '../ast/Node';
import { Spec } from '../ast/Spec';
import { Document } from '../ast/Document';
import { LocatedException } from '../LocatedException';
import { DocumentContext } from '../parser/DocumentContext';
import { NodeAnalyzer } from './NodeAnalyzer';
import { ImportAnalyzer } from './ImportAnalyzer';

interface AnalysisConfig {
    spec: Spec;
    doc: Document;
    errors: Array< LocatedException >;
    stopOnTheFirstError: boolean;
}

/**
 * Semantic analyzer
 */
export class SemanticAnalyzer {

    private _importAnalyzer: ImportAnalyzer = new ImportAnalyzer();

    public analyze( spec: Spec, errors: Array< LocatedException >, stopOnTheFirstError: boolean ) {
        let doc: Document, cfg: AnalysisConfig;
        for ( let i in spec.documents ) {
            doc = spec.documents[ i ];
            cfg = { doc: doc, spec: spec, errors: errors, stopOnTheFirstError: stopOnTheFirstError };            
            // Imports
            this.analyzeItems( doc.imports, this._importAnalyzer, cfg );
        }
    }

    private analyzeItems< T extends Node >(
        items: Array< T >,
        analyzer: NodeAnalyzer< T >,
        cfg: AnalysisConfig
    ) {
        let i, node;
        for ( i in items ) {
            node = items[ i ];
            analyzer.analyzeInDocument( node, cfg.doc, cfg.errors, cfg.stopOnTheFirstError );
            analyzer.analyzeInSpec( node, cfg.spec, cfg.errors, cfg.stopOnTheFirstError );
        }
    }

}