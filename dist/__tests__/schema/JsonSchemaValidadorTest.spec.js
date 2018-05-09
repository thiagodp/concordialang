"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonSchemaValidator_1 = require("../../modules/schema/JsonSchemaValidator");
const jsonSchemaGenerator = require("json-schema-generator");
/**
 * @author Thiago Delgado Pinto
 */
describe('JsonSchemaValidadorTest', () => {
    let v = new JsonSchemaValidator_1.JsonSchemaValidator();
    it('throws an exception when receives an empty content object', () => {
        let content = {};
        let schema = jsonSchemaGenerator({ "foo": "bar" });
        expect(() => { v.validate(content, schema); }).toThrow();
    });
    it('throws an exception when receives an incompatible content object', () => {
        let content = { 'nonfoo': 'bar' };
        let schema = jsonSchemaGenerator({ "foo": "bar" });
        expect(() => { v.validate(content, schema); }).toThrow();
    });
    it('does not throw an exception when receives an compatible content object', () => {
        let content = { 'foo': 'zaa' };
        let schema = jsonSchemaGenerator({ "foo": "bar" });
        expect(() => { v.validate(content, schema); }).not.toThrow();
    });
});
//# sourceMappingURL=JsonSchemaValidadorTest.spec.js.map