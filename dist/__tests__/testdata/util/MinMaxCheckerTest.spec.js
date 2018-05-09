"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MinMaxChecker_1 = require("../../../modules/testdata/util/MinMaxChecker");
describe('MinMaxCheckerTest', () => {
    let c = new MinMaxChecker_1.MinMaxChecker(); // under test
    const defaultDelta = 0.01;
    const comparedDecimalPlaces = 10;
    it('fractional part - returns integer when both min and max are integers', () => {
        const val = c.greatestFractionalPart(defaultDelta, '0', '10');
        expect(val).toBe(1);
    });
    it('fractional part - returns double when min is double and max is integer', () => {
        const val = c.greatestFractionalPart(defaultDelta, '0.0', '10');
        expect(val).toBeCloseTo(0.1, comparedDecimalPlaces);
    });
    it('fractional part - returns double when min is integer and max is double', () => {
        const val = c.greatestFractionalPart(defaultDelta, '1', '10.0');
        expect(val).toBeCloseTo(0.1, comparedDecimalPlaces);
    });
    it('fractional part - right precision for double values', () => {
        let val = c.greatestFractionalPart(defaultDelta, '1.0', '10.0');
        expect(val).toBeCloseTo(0.1, comparedDecimalPlaces);
        val = c.greatestFractionalPart(defaultDelta, '1.00', '10.0');
        expect(val).toBeCloseTo(0.01, comparedDecimalPlaces);
        val = c.greatestFractionalPart(defaultDelta, '1.0', '10.00');
        expect(val).toBeCloseTo(0.01, comparedDecimalPlaces);
        val = c.greatestFractionalPart(defaultDelta, '1.00', '10.00');
        expect(val).toBeCloseTo(0.01, comparedDecimalPlaces);
        val = c.greatestFractionalPart(defaultDelta, '1.000', '10.00');
        expect(val).toBeCloseTo(0.001, comparedDecimalPlaces);
        val = c.greatestFractionalPart(defaultDelta, '1.00', '10.000');
        expect(val).toBeCloseTo(0.001, comparedDecimalPlaces);
    });
});
//# sourceMappingURL=MinMaxCheckerTest.spec.js.map