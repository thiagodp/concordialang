import { AfterAllSSA } from './AfterAllSSA';
import { BeforeAllSSA } from './BeforeAllSSA';
import { ConstantSSA } from './ConstantSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { TableSSA } from './TableSSA';
import { TestCaseSSA } from './TestCaseSSA';
/**
 * Executes semantic analyzers in batch.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchSpecificationAnalyzer extends SpecificationAnalyzer {
    constructor() {
        super();
        // Order is relevant!
        this._analyzers = [
            new ImportSSA(),
            new FeatureSSA(),
            new ConstantSSA(),
            new DatabaseSSA(),
            new TableSSA(),
            new TestCaseSSA(),
            new BeforeAllSSA(),
            new AfterAllSSA()
        ];
    }
    /** @inheritDoc */
    async analyze(problems, spec, graph) {
        let anyError = false;
        for (let analyzer of this._analyzers) {
            const ok = await analyzer.analyze(problems, spec, graph);
            if (!ok) {
                anyError = true;
            }
        }
        return anyError;
    }
}
