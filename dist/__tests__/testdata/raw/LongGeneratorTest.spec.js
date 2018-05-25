"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LongGenerator_1 = require("../../../modules/testdata/raw/LongGenerator");
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
describe('LongGeneratorTest', () => {
    const ranL = new RandomLong_1.RandomLong(new Random_1.Random('concordia'));
    const aMin = 0;
    const aMax = 10;
    const aMedian = 5;
    const gen = new LongGenerator_1.LongGenerator(ranL, aMin, aMax); // under test
    it('random below min', () => {
        expect(gen.randomBelowMin()).toBeLessThan(aMin);
    });
    it('just below min', () => {
        expect(gen.justBelowMin()).toBe(aMin - 1);
    });
    it('just above min', () => {
        expect(gen.justAboveMin()).toBe(aMin + 1);
    });
    it('median value', () => {
        expect(gen.median()).toBe(aMedian);
        const gen2 = new LongGenerator_1.LongGenerator(ranL, 1, 1);
        expect(gen2.median()).toBe(1);
    });
    it('random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect(val).toBeGreaterThan(aMin);
        expect(val).toBeLessThan(aMax);
    });
    it('just below max', () => {
        expect(gen.justBelowMax()).toBe(aMax - 1);
    });
    it('just above max', () => {
        expect(gen.justAboveMax()).toBe(aMax + 1);
    });
    it('random above max', () => {
        expect(gen.randomAboveMax()).toBeGreaterThan(aMax);
    });
});
