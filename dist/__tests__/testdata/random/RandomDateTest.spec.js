"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomDate_1 = require("../../../modules/testdata/random/RandomDate");
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
const js_joda_1 = require("js-joda");
describe('RandomDateTest', () => {
    let random = new RandomDate_1.RandomDate(new RandomLong_1.RandomLong(new Random_1.Random()));
    it('generates a random value between min and max, inclusive', () => {
        const min = js_joda_1.LocalDate.of(2018, 1, 1), max = js_joda_1.LocalDate.of(2018, 1, 31);
        const val = random.between(min, max);
        expect(val.isAfter(min) || val.isEqual(min)).toBeTruthy();
        expect(val.isBefore(max) || val.isEqual(max)).toBeTruthy();
    });
    it('generates a value greater than a min value', () => {
        const min = js_joda_1.LocalDate.of(2018, 1, 1);
        const val = random.after(min);
        expect(val.isAfter(min)).toBeTruthy();
    });
    it('generates a value less than a max value', () => {
        const max = js_joda_1.LocalDate.of(2018, 1, 31);
        const val = random.before(max);
        expect(val.isBefore(max)).toBeTruthy();
    });
});
