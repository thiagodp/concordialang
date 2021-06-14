import { DatabaseDA } from './DatabaseDA';
import { ImportDA } from './ImportDA';
import { ScenarioDA } from './ScenarioDA';
import { UIElementDA } from './UIElementDA';
import { VariantGivenStepDA } from './VariantGivenStepDA';
/**
 * Executes a series of semantic analyzers to a document.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchDocumentAnalyzer {
    constructor() {
        this._analyzers = [
            new ImportDA(),
            new ScenarioDA(),
            new DatabaseDA(),
            new UIElementDA(),
            new VariantGivenStepDA()
        ];
    }
    analyze(doc, errorMapper) {
        for (let analyzer of this._analyzers) {
            const errors = [];
            analyzer.analyze(doc, errors);
            if (errors.length > 0) {
                errorMapper.addError(doc.fileInfo.path, ...errors);
            }
        }
    }
}
