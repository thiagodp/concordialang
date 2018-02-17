import { TableSSA } from './TableSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SpecSemanticAnalyzer } from './SpecSemanticAnalyzer';
import { Spec } from "../ast/Spec";
import { VariantSSA } from './VariantSSA';
import { SemanticException } from './SemanticException';

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
            new DatabaseSSA(),
            new TableSSA(),
            new VariantSSA()
        ];
    }

    public analyze = async (
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > => {
        for ( let analyzer of this._analyzers ) {
            await analyzer.analyze( spec, errors );
        }
    };

}