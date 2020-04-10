import { Document } from '../../ast/Document';
import { ProblemMapper } from '../../error/ProblemMapper';
import { SemanticException } from "../../error/SemanticException";
import { DatabaseDA } from './DatabaseDA';
import { DocumentAnalyzer } from './DocumentAnalyzer';
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

    private readonly _analyzers: DocumentAnalyzer[];

    constructor() {
        this._analyzers = [
            new ImportDA(),
            new ScenarioDA(),
            new DatabaseDA(),
            new UIElementDA(),
            new VariantGivenStepDA()
        ];
    }

    public analyze( doc: Document, errorMapper: ProblemMapper ) {
        for ( let analyzer of this._analyzers ) {
            const errors: SemanticException[] = [];
            analyzer.analyze( doc, errors );
            if ( errors.length > 0 ) {
                errorMapper.addError( doc.fileInfo.path, ...errors );
            }
        }
    }

}