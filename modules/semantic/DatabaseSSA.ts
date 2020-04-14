import Graph = require('graph.js/dist/graph.full.js');

import { DatabaseConnectionChecker2 } from '../db/DatabaseConnectionChecker2';
import { ProblemMapper } from '../error/ProblemMapper';
import { SemanticException } from '../error/SemanticException';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Analyzes Databases in a specification.
 *
 * It checks for:
 * - duplicated names
 * - connection to the defined databases <<< NEEDED HERE ???
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {

        let errors: SemanticException[] = [];
        this._checker.checkDuplicatedNamedNodes( spec.databases(), errors, 'database' );
        const ok1 = 0 === errors.length;
        if ( ! ok1 ) {
            problems.addGenericError( ...errors );
        }

        const ok2 = await this.checkConnections( problems, spec );

        return ok1 && ok2;
    }

    private async checkConnections(
        problems: ProblemMapper,
        spec: AugmentedSpec
    ): Promise< boolean > {
        let checker = new DatabaseConnectionChecker2();
        let r = await checker.check( spec, problems );
        return r ? r.success : false;
    }

}