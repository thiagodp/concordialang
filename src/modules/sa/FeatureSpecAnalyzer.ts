import { NodeBasedSpecAnalyzer } from "./NodeBasedSpecAnalyzer";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";

/**
 * Feature semantic analyzer for a specification.
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureSpecAnalyzer implements NodeBasedSpecAnalyzer {

     /** @inheritDoc */
    public analyze( spec: Spec, errors: LocatedException[] ) {
        this.checkForDuplicatedFeatureNames( spec, errors );
    }

    private checkForDuplicatedFeatureNames( spec: Spec, errors: LocatedException[] ) {
        // TO-DO
    }
}