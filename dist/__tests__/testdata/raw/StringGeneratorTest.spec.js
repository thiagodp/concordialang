"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StringGenerator_1 = require("../../../modules/testdata/raw/StringGenerator");
const RandomString_1 = require("../../../modules/testdata/random/RandomString");
const Random_1 = require("../../../modules/testdata/random/Random");
describe('StringGeneratorTest', () => {
    const ranL = new RandomString_1.RandomString(new Random_1.Random('concordia'));
    const aMin = 2;
    const aMax = 10;
    const aMedian = 6;
    const gen = new StringGenerator_1.StringGenerator(ranL, aMin, aMax); // under test
    it('lowest', () => {
        expect(gen.lowest().length).toBe(0);
    });
    it('random below min', () => {
        expect(gen.randomBelowMin().length).toBeLessThan(aMin);
    });
    it('just below min', () => {
        expect(gen.justBelowMin().length).toBe(aMin - 1);
    });
    it('just above min', () => {
        expect(gen.justAboveMin().length).toBe(aMin + 1);
    });
    it('median value', () => {
        expect(gen.median().length).toBe(aMedian);
        const gen2 = new StringGenerator_1.StringGenerator(ranL, 1, 1);
        expect(gen2.median().length).toBe(1);
    });
    it('random between min and max', () => {
        const val = gen.randomBetweenMinAndMax().length;
        expect(val).toBeGreaterThan(aMin);
        expect(val).toBeLessThan(aMax);
    });
    it('just below max', () => {
        expect(gen.justBelowMax().length).toBe(aMax - 1);
    });
    it('just above max', () => {
        expect(gen.justAboveMax().length).toBe(aMax + 1);
    });
    it('random above max', () => {
        expect(gen.randomAboveMax().length).toBeGreaterThan(aMax);
    });
});
//# sourceMappingURL=StringGeneratorTest.spec.js.map