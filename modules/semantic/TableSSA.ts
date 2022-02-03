import Graph from 'graph.js/dist/graph.full.js';

import { ProblemMapper } from '../error/ProblemMapper';
import { SemanticException } from '../error/SemanticException';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Analyzes Tables from a specification.
 *
 * It checks for:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class TableSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {

        let errors: SemanticException[] = [];
        this._checker.checkDuplicatedNamedNodes( spec.tables(), errors, 'table' );
        const ok1 = 0 === errors.length;
        if ( ! ok1 ) {
            problems.addGenericError( ...errors );
        }
        return ok1;
    }

}