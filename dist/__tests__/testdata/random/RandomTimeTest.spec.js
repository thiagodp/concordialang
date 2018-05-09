"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomTime_1 = require("../../../modules/testdata/random/RandomTime");
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
const js_joda_1 = require("js-joda");
describe('RandomTimeTest', () => {
    let random = new RandomTime_1.RandomTime(new RandomLong_1.RandomLong(new Random_1.Random()));
    it('generates a random value between min and max, inclusive', () => {
        const min = js_joda_1.LocalTime.of(12, 0, 0), max = js_joda_1.LocalTime.of(13, 0, 0);
        const val = random.between(min, max);
        expect(val.isAfter(min) || 0 === val.compareTo(min)).toBeTruthy();
        expect(val.isBefore(max) || 0 === val.compareTo(max)).toBeTruthy();
    });
    it('generates a value greater than a min value', () => {
        const min = js_joda_1.LocalTime.of(12, 0, 0);
        const val = random.after(min);
        expect(val.isAfter(min)).toBeTruthy();
    });
    it('generates a value less than a max value', () => {
        const max = js_joda_1.LocalTime.of(13, 0, 0);
        const val = random.before(max);
        expect(val.isBefore(max)).toBeTruthy();
    });
});
//# sourceMappingURL=RandomTimeTest.spec.js.map