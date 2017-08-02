import { Scenario } from '../ast/Scenario';
import { NodeAnalyzer } from './NodeAnalyzer';
import { Node } from '../ast/Node';
import { Feature } from '../ast/Feature';
import { Document } from '../ast/Document';
import { Spec } from '../ast/Spec';
import { LocatedException } from "../LocatedException";
import { SemanticException } from './SemanticException';
import { Keywords } from "../Keywords";

export class ScenarioAnalyzer extends NodeAnalyzer< Scenario > {

    /** @inheritDoc */
    public analyzeNodes(
        current: Scenario,
        nodes: Array< Node >,
        doc: Document,
        errors: Array< LocatedException >,
        stopAtFirstError: boolean
    ): void {
        // TO-DO: To detect duplicated scenario names
    }

    /** @inheritDoc */
    public analyzeDocuments(
        current: Scenario,
        spec: Spec,
        errors: LocatedException[],
        stopAtFirstError: boolean
    ): void {
        // Nothing to do
    }

    /** @inheritDoc */
    public forbiddenPriorKeywords(): string[] {
        return [
            Keywords.COMMENT,
            Keywords.TAG,
            Keywords.IMPORT,
            Keywords.FEATURE,
            Keywords.SCENARIO
        ];
    }    

}