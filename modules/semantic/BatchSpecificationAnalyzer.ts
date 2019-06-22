import Graph = require('graph.js/dist/graph.full.js');

import { AugmentedSpec } from '../req/AugmentedSpec';
import { AfterAllSSA } from './AfterAllSSA';
import { BeforeAllSSA } from './BeforeAllSSA';
import { ConstantSSA } from './ConstantSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SemanticException } from './SemanticException';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { TableSSA } from './TableSSA';
import { TestCaseSSA } from './TestCaseSSA';
import { UIElementSSA } from './UIElementSSA';

/**
 * Executes semantic analyzers into a specification in batch.
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

    public async analyze(
        graph: Graph,
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void > {

        // Important to guarantee that all documents are mapped
        spec.clearCache();
        spec.mapAllDocuments();

        for ( let analyzer of this._analyzers ) {
            await analyzer.analyze( graph, spec, errors );
        }
    }

}