import { TableSSA } from './TableSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { Spec } from "../ast/Spec";
import { TestCaseSSA } from './TestCaseSSA';
import { SemanticException } from './SemanticException';
import { ConstantSSA } from './ConstantSSA';
import { UIElementSSA } from './UIElementSSA';
import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Executes many semantic analyzers to a specification in batch.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchSpecificationAnalyzer extends SpecificationAnalyzer {

    private readonly _analyzers: SpecificationAnalyzer[];

    constructor() {
        super();

        this._analyzers = [
            new ImportSSA(),
            new FeatureSSA(),
            new ConstantSSA(),
            new DatabaseSSA(),
            new TableSSA(),
            new UIElementSSA(),
            new TestCaseSSA()
        ];
    }

    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        for ( let analyzer of this._analyzers ) {
            await analyzer.analyze( graph, spec, errors );
        }
    }

}