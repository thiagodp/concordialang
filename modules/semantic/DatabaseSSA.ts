import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';
import { Warning } from '../req/Warning';
import { DatabaseConnectionChecker } from '../db/DatabaseConnectionChecker';
import { ConnectionCheckResult } from '../req/ConnectionResult';
import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Executes semantic analysis of Databases in a specification.
 *
 * Checkings:
 * - duplicated names
 * - connection to the defined databases <<< NEDDED HERE ???
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.databases(), errors, 'database' );
        await this.checkConnections( spec, errors );
    }

    private checkConnections = async ( spec: Spec, errors: SemanticException[] ): Promise< boolean > => {
        let checker = new DatabaseConnectionChecker();
        // Important: errors and warnings are also added to the corresponding doc
        let r = await checker.check( spec, errors );
        return r.success;
    };

}