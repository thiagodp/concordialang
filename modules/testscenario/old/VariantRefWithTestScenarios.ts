import { VariantRef } from "./VariantRef";
import { TestScenario } from "./TestScenario";
import { State } from "../../ast/VariantLike";

export class VariantRefWithTestScenarios extends VariantRef {

    public testScenarios: TestScenario[] = [];

    hasPostconditionNamed( name: string ): boolean {
        if ( ! this.variant.preconditions || this.variant.preconditions.length < 1 ) {
            return false;
        }
        return ( this.variant.postconditions.find( p => p.nameEquals( name ) ) || null ) !== null;
    }

}