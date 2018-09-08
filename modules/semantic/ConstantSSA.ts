import Graph = require('graph.js/dist/graph.full.js');

import { Spec } from '../ast/Spec';
import { SemanticException } from './SemanticException';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Executes semantic analysis of Constants in a specification.
 *
 * Checkings:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.constants(), errors, 'constant' );
    }

}