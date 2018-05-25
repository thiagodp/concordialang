"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DoubleGenerator_1 = require("../../../modules/testdata/raw/DoubleGenerator");
const RandomDouble_1 = require("../../../modules/testdata/random/RandomDouble");
const Random_1 = require("../../../modules/testdata/random/Random");
describe('DoubleGeneratorTest', () => {
    let ranD = new RandomDouble_1.RandomDouble(new Random_1.Random('concordia')); // under test
    it('random below min', () => {
        const min = '0.00';
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, min, '1.00');
        expect(gen.randomBelowMin()).toBeLessThan(Number(min));
    });
    it('just below min', () => {
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, '0.00', '1.00');
        expect(gen.justBelowMin()).toBeCloseTo(-0.01, 10);
    });
    it('just above min', () => {
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, '0.00', '1.00');
        expect(gen.justAboveMin()).toBeCloseTo(0.01, 10);
    });
    it('median value', () => {
        const gen1 = new DoubleGenerator_1.DoubleGenerator(ranD, '0', '10');
        expect(gen1.median()).toBeCloseTo(5, 10);
        const gen2 = new DoubleGenerator_1.DoubleGenerator(ranD, '1', '1');
        expect(gen2.median()).toBeCloseTo(1, 10);
    });
    it('random between min and max', () => {
        const min = '0.0';
        const max = '1.0';
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, min, max);
        const val = gen.randomBetweenMinAndMax();
        expect(val).toBeGreaterThan(Number(min));
        expect(val).toBeLessThan(Number(max));
    });
    it('just below max', () => {
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, '0.00', '1.00');
        expect(gen.justBelowMax()).toBeCloseTo(0.99, 10);
    });
    it('just above max', () => {
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, '0.00', '1.00');
        expect(gen.justAboveMax()).toBeCloseTo(1.01, 10);
    });
    it('random above max', () => {
        const max = '1.00';
        const gen = new DoubleGenerator_1.DoubleGenerator(ranD, '0.00', max);
        expect(gen.randomAboveMax()).toBeGreaterThan(Number(max));
    });
});
