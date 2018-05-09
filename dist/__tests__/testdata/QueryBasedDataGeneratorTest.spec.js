"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueryBasedDataGenerator_1 = require("../../modules/testdata/QueryBasedDataGenerator");
const RandomLong_1 = require("../../modules/testdata/random/RandomLong");
const Random_1 = require("../../modules/testdata/random/Random");
const StringGenerator_1 = require("../../modules/testdata/raw/StringGenerator");
const RandomString_1 = require("../../modules/testdata/random/RandomString");
const QueryCache_1 = require("../../modules/db/QueryCache");
/**
 * @author Thiago Delgado Pinto
 */
describe('QueryBasedDataGeneratorTest', () => {
    class FakeQueryable {
        constructor(_values) {
            this._values = _values;
            /** @inheritDoc */
            this.query = (cmd, params) => __awaiter(this, void 0, void 0, function* () {
                return this._values;
            });
        }
    }
    /// Generates a function for using in a describe() declaration
    let check = (gen) => {
        return () => {
            it('first element', () => __awaiter(this, void 0, void 0, function* () {
                const val = yield gen.firstElement();
                expect(val).toBe('one');
            }));
            it('second element', () => __awaiter(this, void 0, void 0, function* () {
                const val = yield gen.secondElement();
                expect(val).toBe('two');
            }));
            it('random element', () => __awaiter(this, void 0, void 0, function* () {
                const val = yield gen.randomElement();
                expect(['one', 'two', 'three', 'four', 'five']).toContain(val);
            }));
            it('penultimate element', () => __awaiter(this, void 0, void 0, function* () {
                const val = yield gen.penultimateElement();
                expect(val).toBe('four');
            }));
            it('last element', () => __awaiter(this, void 0, void 0, function* () {
                const val = yield gen.lastElement();
                expect(val).toBe('five');
            }));
        };
    };
    const rand = new Random_1.Random();
    const randL = new RandomLong_1.RandomLong(rand);
    const strGen = new StringGenerator_1.StringGenerator(new RandomString_1.RandomString(rand));
    const queryCache = new QueryCache_1.QueryCache();
    let rawValueGen = new QueryBasedDataGenerator_1.QueryBasedDataGenerator(randL, strGen, new FakeQueryable([
        ['one', 1],
        ['two', 2],
        ['three', 3],
        ['four', 4],
        ['five', 5]
    ]), queryCache, 'SELECT whathever FROM doesnt_matter');
    let objValueGen = new QueryBasedDataGenerator_1.QueryBasedDataGenerator(randL, strGen, new FakeQueryable([
        { 'f1': 'one', 'f2': 1 },
        { 'f1': 'two', 'f2': 2 },
        { 'f1': 'three', 'f2': 3 },
        { 'f1': 'four', 'f2': 4 },
        { 'f1': 'five', 'f2': 5 }
    ]), queryCache, 'SELECT whathever FROM doesnt_matter');
    describe('raw value', check(rawValueGen));
    describe('object value', check(objValueGen));
});
//# sourceMappingURL=QueryBasedDataGeneratorTest.spec.js.map