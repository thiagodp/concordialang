import Graph = require('graph.js/dist/graph.full.js');

import { ProblemMapper } from '../error/ProblemMapper';
import { SemanticException } from '../error/SemanticException';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Analyzes Features from a specification.
 *
 * It checks for:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class FeatureSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {

        let errors: SemanticException[] = [];
        this._checker.checkDuplicatedNamedNodes( spec.features(), errors, 'feature' );
        const ok1 = 0 === errors.length;
        if ( ! ok1 ) {
            problems.addGenericError( ...errors );
        }
        return ok1;
    }

}