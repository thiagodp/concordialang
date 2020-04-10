import Graph = require('graph.js/dist/graph.full.js');

import { ProblemMapper } from '../error/ProblemMapper';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { AfterAllSSA } from './AfterAllSSA';
import { BeforeAllSSA } from './BeforeAllSSA';
import { ConstantSSA } from './ConstantSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { TableSSA } from './TableSSA';
import { TestCaseSSA } from './TestCaseSSA';
import { UIElementSSA } from './UIElementSSA';

/**
 * Executes semantic analyzers in batch.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchSpecificationAnalyzer extends SpecificationAnalyzer {

    private readonly _analyzers: SpecificationAnalyzer[];

    constructor() {
        super();

        // Order is relevant!
        this._analyzers = [
            new ImportSSA(),
            new UIElementSSA(), // needed before other global declarations
            new FeatureSSA(),
            new ConstantSSA(),
            new DatabaseSSA(),
            new TableSSA(),
            new TestCaseSSA(), // TODO: change the SSA to receive a dictionary loader, according to the analyzed doc
            new BeforeAllSSA(),
            new AfterAllSSA()
        ];
    }

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {

        let anyError = false;
        for ( let analyzer of this._analyzers ) {
            const ok = await analyzer.analyze( problems, spec, graph );
            if ( ! ok ) {
                anyError = true;
            }
        }
        return anyError;
    }

}