import { TableSSA } from './TableSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SpecSemanticAnalyzer } from './SpecSemanticAnalyzer';
import { Spec } from "../ast/Spec";
import { TestCaseSSA } from './TestCaseSSA';
import { SemanticException } from './SemanticException';
import { ConstantSSA } from './ConstantSSA';
import { UIElementSSA } from './UIElementSSA';

/**
 * Executes many semantic analyzers to a specification in batch.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchSpecSemanticAnalyzer {

    private readonly _analyzers: SpecSemanticAnalyzer[];

    constructor() {
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
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        for ( let analyzer of this._analyzers ) {
            await analyzer.analyze( spec, errors );
        }
    }

}