import Graph = require('graph.js/dist/graph.full.js');

import { AugmentedSpec } from '../ast/AugmentedSpec';
import { DatabaseConnectionChecker } from '../db/DatabaseConnectionChecker';
import { SemanticException } from './SemanticException';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

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
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.databases(), errors, 'database' );
        await this.checkConnections( spec, errors );
    }

    private checkConnections = async ( spec: AugmentedSpec, errors: SemanticException[] ): Promise< boolean > => {
        let checker = new DatabaseConnectionChecker();
        // Important: errors and warnings are also added to the corresponding doc
        let r = await checker.check( spec, errors );
        return r.success;
    };

}