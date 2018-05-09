"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomDouble_1 = require("../../../modules/testdata/random/RandomDouble");
const Random_1 = require("../../../modules/testdata/random/Random");
describe('RandomDoubleTest', () => {
    let random = new RandomDouble_1.RandomDouble(new Random_1.Random());
    let delta = 0.0000000001;
    it('generates a random value between min and max, inclusive', () => {
        const x = 100;
        const min = x + delta;
        const max = x + (delta * 2);
        let val = random.between(min, max);
        expect(val).toBeGreaterThanOrEqual(min);
        expect(val).toBeLessThanOrEqual(max);
    });
    it('generates a value greater than a min value', () => {
        const min = -2.0;
        let val = random.after(min, delta);
        expect(val).toBeGreaterThan(min);
    });
    it('generates a value less than a max value', () => {
        const max = 2.0;
        let val = random.before(max, delta);
        expect(val).toBeLessThan(max);
    });
});
//# sourceMappingURL=RandomDoubleTest.spec.js.map