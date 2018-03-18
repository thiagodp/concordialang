import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { SpecificationAnalyzer } from "./SpecificationAnalyzer";
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';
import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Executes semantic analysis of Tables in a specification.
 *
 * Checkings:
 * - duplicated names
 * - declared table structure through its instantiation << TO-DO ???
 *
 * @author Thiago Delgado Pinto
 */
export class TableSSA extends SpecificationAnalyzer {

     /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.tables(), errors, 'table' );
    }

}