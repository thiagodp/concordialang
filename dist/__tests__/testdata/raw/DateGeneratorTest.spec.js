"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DateGenerator_1 = require("../../../modules/testdata/raw/DateGenerator");
const js_joda_1 = require("js-joda");
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
const RandomDate_1 = require("../../../modules/testdata/random/RandomDate");
describe('DateGeneratorTest', () => {
    const ranL = new RandomLong_1.RandomLong(new Random_1.Random('concordia'));
    const ranD = new RandomDate_1.RandomDate(ranL);
    const aMin = js_joda_1.LocalDate.of(2018, 1, 1);
    const aMax = js_joda_1.LocalDate.of(2018, 1, 30);
    const aMedian = js_joda_1.LocalDate.of(2018, 1, 15);
    const gen = new DateGenerator_1.DateGenerator(ranD, aMin, aMax); // under test
    it('random below min', () => {
        expect(gen.randomBelowMin().isBefore(aMin)).toBeTruthy();
    });
    it('just below min', () => {
        expect(gen.justBelowMin()).toEqual(aMin.minusDays(1));
    });
    it('just above min', () => {
        expect(gen.justAboveMin()).toEqual(aMin.plusDays(1));
    });
    describe('median value', () => {
        it('of ' + aMin.toString() + ' and ' + aMax.toString(), () => {
            expect(gen.median()).toEqual(aMedian);
        });
        it('of two consecutive days', () => {
            expect(new DateGenerator_1.DateGenerator(ranD, js_joda_1.LocalDate.of(2018, 1, 1), js_joda_1.LocalDate.of(2018, 1, 2)).median()).toEqual(js_joda_1.LocalDate.of(2018, 1, 1));
        });
        it('of two odd days', () => {
            expect(new DateGenerator_1.DateGenerator(ranD, js_joda_1.LocalDate.of(2018, 1, 1), js_joda_1.LocalDate.of(2018, 1, 3)).median()).toEqual(js_joda_1.LocalDate.of(2018, 1, 2));
        });
    });
    it('random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect(val.isAfter(aMin)).toBeTruthy();
        expect(val.isBefore(aMax)).toBeTruthy();
    });
    it('just below max', () => {
        expect(gen.justBelowMax()).toEqual(aMax.minusDays(1));
    });
    it('just above max', () => {
        expect(gen.justAboveMax()).toEqual(aMax.plusDays(1));
    });
    it('random above max', () => {
        expect(gen.randomAboveMax().isAfter(aMax)).toBeTruthy();
    });
});
//# sourceMappingURL=DateGeneratorTest.spec.js.map