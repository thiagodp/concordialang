"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomLong_1 = require("../../../modules/testdata/random/RandomLong");
const Random_1 = require("../../../modules/testdata/random/Random");
describe('RandomLongTest', () => {
    let random = new RandomLong_1.RandomLong(new Random_1.Random());
    it('generates a random value between min and max, inclusive', () => {
        const min = -2, max = 2;
        let val = random.between(min, max);
        expect(val).toBeGreaterThanOrEqual(min);
        expect(val).toBeLessThanOrEqual(max);
    });
    it('generates a value greater than a min value', () => {
        const min = -2;
        let val = random.after(min);
        expect(val).toBeGreaterThan(min);
    });
    it('generates a value less than a max value', () => {
        const max = 2;
        let val = random.before(max);
        expect(val).toBeLessThan(max);
    });
});
