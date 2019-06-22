import Graph = require('graph.js/dist/graph.full.js');

import { AugmentedSpec } from '../req/AugmentedSpec';
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Specification semantic analyzer.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class SpecificationAnalyzer {

    protected readonly _checker = new DuplicationChecker();

    /**
     * Analyzes the given specification.
     *
     * @param spec Specification to analyze.
     * @param errors Errors found.
     */
    public abstract async analyze(
        graph: Graph,
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void >;

}