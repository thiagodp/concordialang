"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DateTimeGenerator_1 = require("../../../modules/testdata/raw/DateTimeGenerator");
const js_joda_1 = require("js-joda");
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
const RandomDateTime_1 = require("../../../modules/testdata/random/RandomDateTime");
describe('DateTimeGeneratorTest', () => {
    const ranL = new RandomLong_1.RandomLong(new Random_1.Random('concordia'));
    const ranD = new RandomDateTime_1.RandomDateTime(ranL);
    const aMin = js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 0);
    const aMax = js_joda_1.LocalDateTime.of(2018, 1, 30, 13, 0, 0);
    const aMedian = js_joda_1.LocalDateTime.of(2018, 1, 15, 12, 30, 0);
    const gen = new DateTimeGenerator_1.DateTimeGenerator(ranD, aMin, aMax); // under test
    it('random below min', () => {
        expect(gen.randomBelowMin().isBefore(aMin)).toBeTruthy();
    });
    it('just below min', () => {
        expect(gen.justBelowMin()).toEqual(aMin.minusSeconds(1));
    });
    it('just above min', () => {
        expect(gen.justAboveMin()).toEqual(aMin.plusSeconds(1));
    });
    describe('median value', () => {
        it('of ' + aMin.toString() + ' and ' + aMax.toString(), () => {
            expect(gen.median()).toEqual(aMedian);
        });
        it('of two consecutive seconds', () => {
            expect(new DateTimeGenerator_1.DateTimeGenerator(ranD, js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 0), js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 1)).median()).toEqual(js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 0));
        });
        it('of two odd seconds', () => {
            expect(new DateTimeGenerator_1.DateTimeGenerator(ranD, js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 1), js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 3)).median()).toEqual(js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 2));
        });
    });
    it('random between min and max', () => {
        const val = gen.randomBetweenMinAndMax();
        expect(val.isAfter(aMin)).toBeTruthy();
        expect(val.isBefore(aMax)).toBeTruthy();
    });
    it('just below max', () => {
        expect(gen.justBelowMax()).toEqual(aMax.minusSeconds(1));
    });
    it('just above max', () => {
        expect(gen.justAboveMax()).toEqual(aMax.plusSeconds(1));
    });
    it('random above max', () => {
        expect(gen.randomAboveMax().isAfter(aMax)).toBeTruthy();
    });
});
