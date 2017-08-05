import { Node } from '../old_ast/Node';
import { Document } from '../old_ast/Document';
import { Feature } from '../old_ast/Feature';
import { Import } from '../old_ast/Import';
import { Scenario } from '../old_ast/Scenario';
import { LocatedException } from '../LocatedException';
import { Keywords } from '../Keywords';
import { AnalyzerMapBuilder } from './AnalyzerMapBuilder';
import { FeatureAnalyzer } from './FeatureAnalyzer';
import { ImportAnalyzer } from './ImportAnalyzer';
import { NodeAnalyzer } from './NodeAnalyzer';
import { ScenarioAnalyzer } from './ScenarioAnalyzer';


/**
 * Builds a Document from an array of nodes.
 */
export class DocumentBuilder {

    private _analyzersMap: {};

    public constructor() {
        this._analyzersMap = ( new AnalyzerMapBuilder() ).build();
    }

    /**
     * Always returns a Document, even if it is incomplete because of errors.
     * 
     * @param nodes Nodes to analyze.
     * @param errors Errors
     * @param stopOnTheFirstError Stop on the first error?
     */
    public build(
        nodes: Array< Node >,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): Document {
        let doc: Document = {};
        let analyzer: NodeAnalyzer< Node >;
        for ( let currentNode of nodes ) {
            analyzer = this._analyzersMap[ currentNode.keyword ];
            if ( ! analyzer ) {
                // TO-DO: log it ? throw an exception ?
                continue;
            }
            analyzer.analyzeNodes( currentNode, nodes, doc, errors, stopOnTheFirstError );
            if ( stopOnTheFirstError && errors.length > 0 ) {
                break;
            }
        }
        return doc;
    } 

}