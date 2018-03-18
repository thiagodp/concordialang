import { DatabaseDA } from './DatabaseDA';
import { DocumentAnalyzer } from './DocumentAnalyzer';
import { ScenarioDA } from './ScenarioDA';
import { LocatedException } from '../../req/LocatedException';
import { ImportDA } from './ImportDA';
import { SemanticException } from '../SemanticException';
import { Import } from '../../ast/Import';
import { Document } from '../../ast/Document';
import { UIElementDA } from './UIElementDA';

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
            new UIElementDA()
        ];
    }

    public analyze( doc: Document, errors: SemanticException[] ) {
        for ( let analyzer of this._analyzers ) {
            analyzer.analyze( doc, errors );
        }
    }

}