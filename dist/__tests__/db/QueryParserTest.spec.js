"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueryParser_1 = require("../../modules/db/QueryParser");
/**
 * @author Thiago Delgado Pinto
 */
describe('QueryParserTest', () => {
    let parser = new QueryParser_1.QueryParser(); // under test
    it('parses all variables correctly', () => {
        let result = parser.parseAnyVariables('SELECT a, b FROM {one}, {two} WHERE {three} and {foo:bar}');
        let [r1, r2, r3, r4] = result;
        expect(r1).toBe('one');
        expect(r2).toBe('two');
        expect(r3).toBe('three');
        expect(r4).toBe('foo:bar');
    });
    it('parses all names correctly', () => {
        let result = parser.parseAnyNames('SELECT a, b FROM [one], [two] WHERE [three]');
        let [x, y, z] = result;
        expect(x).toBe('one');
        expect(y).toBe('two');
        expect(z).toBe('three');
    });
    it('does not parse excel table names as names', () => {
        let result = parser.parseAnyNames('SELECT a, b FROM [one], [excel table$], [excel$A1$B2], [two] WHERE [three]');
        let [x, y, z] = result;
        expect(x).toBe('one');
        expect(y).toBe('two');
        expect(z).toBe('three');
    });
});
