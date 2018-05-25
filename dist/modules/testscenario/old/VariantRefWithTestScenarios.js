"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VariantRef_1 = require("./VariantRef");
class VariantRefWithTestScenarios extends VariantRef_1.VariantRef {
    constructor() {
        super(...arguments);
        this.testScenarios = [];
    }
    hasPostconditionNamed(name) {
        if (!this.variant.preconditions || this.variant.preconditions.length < 1) {
            return false;
        }
        return (this.variant.postconditions.find(p => p.nameEquals(name)) || null) !== null;
    }
}
exports.VariantRefWithTestScenarios = VariantRefWithTestScenarios;
