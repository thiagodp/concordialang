"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("../../modules/req/Expressions");
describe('Expressions Test', () => {
    it('espaces a char for a regex correctly', () => {
        expect(Expressions_1.Expressions.escape('.')).toBe("\\.");
    });
    it('espaces all chars for a regex correctly', () => {
        expect(Expressions_1.Expressions.escapeAll(['.', '[']))
            .toEqual(["\\.", "\\["]);
    });
    it('creates a regex to ignore the given characters', () => {
        let r = Expressions_1.Expressions.anythingBut(['"']).test('hello world');
        expect(r).toBeTruthy();
        r = Expressions_1.Expressions.anythingBut(['"']).test('hello "world');
        expect(r).toBeFalsy();
    });
});
