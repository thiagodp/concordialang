import { Document } from '../../ast/Document';
import { SemanticException } from '../SemanticException';
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

    public analyze( doc: Document, errors: SemanticException[] ) {
        for ( let analyzer of this._analyzers ) {
            analyzer.analyze( doc, errors );
        }
    }

}