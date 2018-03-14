import { DatabaseDA } from './DatabaseDA';
import { DocAnalyzer } from './DocAnalyzer';
import { ScenarioDA } from './ScenarioDA';
import { LocatedException } from '../../req/LocatedException';
import { ImportDA } from './ImportDA';
import { SemanticException } from '../SemanticException';
import { Import } from '../../ast/Import';
import { Document } from '../../ast/Document';
import { UIElementDA } from './UIElementDA';

/**
 * Executes semantic analysers to a single document in batch.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchDocSemanticAnalyzer {

    private readonly _analyzers: DocAnalyzer[];

    constructor() {
        this._analyzers = [
            new ImportDA(),
            new ScenarioDA(),
            new DatabaseDA(),
            new UIElementDA
        ];
    }

    public analyze( doc: Document, errors: SemanticException[] ) {
        for ( let analyzer of this._analyzers ) {
            analyzer.analyze( doc, errors );
        }
    }

}