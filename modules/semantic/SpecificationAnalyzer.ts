import Graph = require('graph.js/dist/graph.full.js');
import { ProblemMapper } from '../error/ProblemMapper';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { DuplicationChecker } from './DuplicationChecker';

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
     * @param problems Maps errors and warnings.
     * @param spec Specification to analyze.
     * @param graph Graph that maps specification's documents.
     * @returns `true` if successful.
     */
    public abstract async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean >;

}