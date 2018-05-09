"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomDateTime_1 = require("../../../modules/testdata/random/RandomDateTime");
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
const js_joda_1 = require("js-joda");
describe('RandomDateTimeTest', () => {
    let random = new RandomDateTime_1.RandomDateTime(new RandomLong_1.RandomLong(new Random_1.Random()));
    it('generates a random value between min and max, inclusive', () => {
        const min = js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 0);
        const max = js_joda_1.LocalDateTime.of(2018, 1, 31, 13, 0, 0);
        const val = random.between(min, max);
        expect(val.isAfter(min) || 0 === val.compareTo(min)).toBeTruthy();
        expect(val.isBefore(max) || 0 === val.compareTo(max)).toBeTruthy();
    });
    it('generates a value greater than a min value', () => {
        const min = js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 0);
        const val = random.after(min);
        expect(val.isAfter(min)).toBeTruthy();
    });
    it('generates a value less than a max value', () => {
        const max = js_joda_1.LocalDateTime.of(2018, 1, 31, 13, 0, 0);
        const val = random.before(max);
        expect(val.isBefore(max)).toBeTruthy();
    });
});
//# sourceMappingURL=RandomDateTimeTest.spec.js.map