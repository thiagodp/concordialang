import { NodeSA } from './NodeSA';
import { ScenarioSA } from './ScenarioSA';
import { LocatedException } from '../../req/LocatedException';
import { ImportSA } from './ImportSA';
import { SemanticException } from '../SemanticException';
import { InputFileExtractor } from '../../util/InputFileExtractor';
import { Import } from '../../req/ast/Import';
import { Document } from '../../req/ast/Document';
import { SemanticAnalysisContext } from '../SemanticAnalysisContext';

/**
 * Node-based Semantic Analyzer
 * 
 * @author Thiago Delgado Pinto
 */
export class NodeBasedSemanticAnalyzer {

    private _nodeSemanticAnalyzers: NodeSA[];

    constructor() {
        this._nodeSemanticAnalyzers = [
            new ImportSA(),
            new ScenarioSA()
        ];
    }

    public analyze( doc: Document, errors: LocatedException[] ) {
        for ( let analyzer of this._nodeSemanticAnalyzers ) {
            analyzer.analyze( doc, errors );
        }
    }

}