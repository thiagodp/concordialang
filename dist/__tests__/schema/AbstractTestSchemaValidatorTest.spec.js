"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractTestSchemaValidator_1 = require("../../modules/schema/AbstractTestSchemaValidator");
/**
 * @author Thiago Delgado Pinto
 */
describe('AbstractTestSchemaValidator', () => {
    let v = new AbstractTestSchemaValidator_1.AbstractTestSchemaValidator(); // under test
    it('throws an exception when receives an content object without schema version', () => {
        let content = { 'foo': 'bar' };
        expect(() => { v.validate(content); }).toThrowError(new RegExp('(schema version not found)', 'ui'));
    });
    it('throws an exception when receives an incompatible content object', () => {
        let content = { 'schemaVersion': '0.1', 'foo': 'bar' };
        expect(() => { v.validate(content); }).toThrowError(new RegExp('(does not match)', 'ui'));
    });
    // TO-DO: add tests with content that pass the validation
});
//# sourceMappingURL=AbstractTestSchemaValidatorTest.spec.js.map