import Graph = require('graph.js/dist/graph.full.js');

import { AugmentedSpec } from '../ast/AugmentedSpec';
import { SemanticException } from './SemanticException';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Executes semantic analysis of Features in a specification.
 *
 * Checkings:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class FeatureSSA extends SpecificationAnalyzer {

     /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.features(), errors, 'feature' );
    }

}