import { Scenario } from '../ast/Scenario';
import { NodeAnalyzer } from './NodeAnalyzer';
import { Feature } from '../ast/Feature';
import { Document } from '../ast/Document';
import { Spec } from '../ast/Spec';
import { LocatedException } from "../LocatedException";
import { SemanticException } from './SemanticException';

export class ScenarioAnalyzer implements NodeAnalyzer< Scenario > {

    /** @inheritDoc */
    public analyzeInDocument(
        current: Scenario,
        doc: Document,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): void {
        // TO-DO: To detect duplicated scenario names
    }

    /** @inheritDoc */
    public analyzeInSpec(
        current: Scenario,
        spec: Spec,
        errors: LocatedException[],
        stopOnTheFirstError: boolean
    ): void {
        // Nothing to do
    }    

}