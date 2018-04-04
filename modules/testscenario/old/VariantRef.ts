import { Document } from "../../ast/Document";
import { Scenario } from "../../ast/Scenario";
import { Variant } from "../../ast/Variant";
import { Feature } from "../../ast/Feature";

export class VariantRef {
    constructor(
        public doc: Document,
        public feature: Feature,
        public scenario: Scenario,
        public variant: Variant
    ) {
    }
}