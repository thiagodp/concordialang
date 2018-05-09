"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegexBasedDataGenerator_1 = require("../../modules/testdata/RegexBasedDataGenerator");
const RandomString_1 = require("../../modules/testdata/random/RandomString");
const Random_1 = require("../../modules/testdata/random/Random");
const RandomLong_1 = require("../../modules/testdata/random/RandomLong");
describe('RegexBaseDataGeneratorTest', () => {
    const ran = new Random_1.Random();
    const ranL = new RandomLong_1.RandomLong(ran);
    const ranS = new RandomString_1.RandomString(ran);
    it('valid values', () => {
        checkValid('[a-z]');
        checkValid('(hello)');
        checkValid('^hello$');
        checkValid('[^a-z]');
        checkValid('[a-z]+');
        checkValid('.{1}');
        checkValid('[0-9]');
        checkValid('[A-z0-9 .-]{2,5}');
        checkValid('[0-9]{2}/[0-9]{2}/[0-9]{4}');
    });
    it('invalid values', () => {
        checkInvalid('[a-z]');
        checkInvalid('(hello)');
        checkInvalid('^hello$');
        checkInvalid('[^a-z]');
        checkInvalid('[a-z]+');
        // checkInvalid( '.{1}' ); <<< not able to handle with '.'
        checkInvalid('[0-9]');
        checkValid('[A-z0-9 .-]{2,5}');
        checkInvalid('[0-9]{2}/[0-9]{2}/[0-9]{4}');
    });
    let checkValid = (exp) => {
        let gen = new RegexBasedDataGenerator_1.RegexBasedDataGenerator(ranL, ranS, exp);
        expect(gen.valid()).toMatch(new RegExp(exp));
    };
    let checkInvalid = (exp) => {
        let gen = new RegexBasedDataGenerator_1.RegexBasedDataGenerator(ranL, ranS, exp);
        expect(gen.invalid()).not.toMatch(new RegExp(exp));
    };
});
//# sourceMappingURL=RegexBaseDataGeneratorTest.spec.js.map