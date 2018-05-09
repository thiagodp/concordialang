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
const DataGenerator_1 = require("../../modules/testdata/DataGenerator");
const DataTestCase_1 = require("../../modules/testdata/DataTestCase");
const ValueTypeDetector_1 = require("../../modules/util/ValueTypeDetector");
const js_joda_1 = require("js-joda");
const DateLimits_1 = require("../../modules/testdata/limits/DateLimits");
const TimeLimits_1 = require("../../modules/testdata/limits/TimeLimits");
const DateTimeLimits_1 = require("../../modules/testdata/limits/DateTimeLimits");
const DataGeneratorBuilder_1 = require("../../modules/testdata/DataGeneratorBuilder");
describe('DataGeneratorTest', () => {
    let gen; // under test
    beforeEach(() => {
        gen = new DataGenerator_1.DataGenerator(new DataGeneratorBuilder_1.DataGeneratorBuilder('concordia'));
    });
    afterEach(() => {
        gen = null;
    });
    //
    // helper functions
    //
    function checkTestCasesOfTheGroupValue(vt, min, max, median, zero, comparator) {
        return () => {
            function checkLessThanMin(tc) {
                return __awaiter(this, void 0, void 0, function* () {
                    let cfg = new DataGenerator_1.DataGenConfig(vt);
                    cfg.minValue = min;
                    const val = yield gen.generate(tc, cfg);
                    // expect( val ).toBeLessThan( cfg.min );
                    expect(comparator(val, cfg.min)).toEqual(-1); // -1 means that the first is lower
                });
            }
            function checkGreaterThanMax(tc) {
                return __awaiter(this, void 0, void 0, function* () {
                    let cfg = new DataGenerator_1.DataGenConfig(vt);
                    cfg.maxValue = max;
                    const val = yield gen.generate(tc, cfg);
                    // expect( val ).toBeGreaterThan( cfg.max );
                    expect(comparator(val, cfg.max)).toEqual(1); // 1 means that the first is greater
                });
            }
            it('VALUE_LOWEST', () => __awaiter(this, void 0, void 0, function* () {
                yield checkLessThanMin(DataTestCase_1.DataTestCase.VALUE_LOWEST);
            }));
            it('VALUE_RANDOM_BELOW_MIN', () => __awaiter(this, void 0, void 0, function* () {
                yield checkLessThanMin(DataTestCase_1.DataTestCase.VALUE_RANDOM_BELOW_MIN);
            }));
            it('VALUE_JUST_BELOW_MIN', () => __awaiter(this, void 0, void 0, function* () {
                yield checkLessThanMin(DataTestCase_1.DataTestCase.VALUE_JUST_BELOW_MIN);
            }));
            it('VALUE_MIN', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minValue = min;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_MIN, cfg);
                // expect( val ).toEqual( cfg.min );
                expect(comparator(val, cfg.min)).toEqual(0);
            }));
            it('VALUE_JUST_ABOVE_MIN', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minValue = min;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_JUST_ABOVE_MIN, cfg);
                // expect( val ).toBeGreaterThan( cfg.min );
                expect(comparator(val, cfg.min)).toEqual(1);
            }));
            it('VALUE_ZERO', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minValue = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_ZERO, cfg);
                // expect( val ).toEqual( zero );
                expect(comparator(val, zero)).toEqual(0);
            }));
            it('VALUE_MEDIAN', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minValue = min;
                cfg.maxValue = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_MEDIAN, cfg);
                // expect( val ).toEqual( median );
                expect(comparator(val, median)).toEqual(0);
            }));
            it('VALUE_RANDOM_BETWEEN_MIN_MAX', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minValue = min;
                cfg.maxValue = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX, cfg);
                // expect( val ).toBeGreaterThanOrEqual( cfg.min );
                // expect( val ).toBeLessThanOrEqual( cfg.max );
                expect(comparator(val, cfg.min)).toBeGreaterThanOrEqual(0);
                expect(comparator(val, cfg.max)).toBeLessThanOrEqual(0);
            }));
            it('VALUE_JUST_BELOW_MAX', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.maxValue = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_JUST_BELOW_MAX, cfg);
                // expect( val ).toBeLessThan( cfg.max );
                expect(comparator(val, cfg.max)).toEqual(-1);
            }));
            it('VALUE_MAX', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.maxValue = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.VALUE_MAX, cfg);
                // expect( val ).toEqual( cfg.max );
                expect(comparator(val, cfg.max)).toEqual(0);
            }));
            it('VALUE_JUST_ABOVE_MAX', () => __awaiter(this, void 0, void 0, function* () {
                yield checkGreaterThanMax(DataTestCase_1.DataTestCase.VALUE_JUST_ABOVE_MAX);
            }));
            it('VALUE_RANDOM_ABOVE_MAX', () => __awaiter(this, void 0, void 0, function* () {
                yield checkGreaterThanMax(DataTestCase_1.DataTestCase.VALUE_RANDOM_ABOVE_MAX);
            }));
            it('VALUE_GREATEST', () => __awaiter(this, void 0, void 0, function* () {
                yield checkGreaterThanMax(DataTestCase_1.DataTestCase.VALUE_GREATEST);
            }));
        };
    }
    function checkTestCasesOfTheGroupLength(vt, min, max, median) {
        return () => {
            function checkLessThanMin(tc) {
                return __awaiter(this, void 0, void 0, function* () {
                    let cfg = new DataGenerator_1.DataGenConfig(vt);
                    cfg.minLength = min;
                    const val = yield gen.generate(tc, cfg);
                    expect(val.length).toBeLessThan(cfg.min);
                });
            }
            function checkGreaterThanMax(tc) {
                return __awaiter(this, void 0, void 0, function* () {
                    let cfg = new DataGenerator_1.DataGenConfig(vt);
                    cfg.maxLength = max;
                    const val = yield gen.generate(tc, cfg);
                    expect(val.length).toBeGreaterThan(cfg.max);
                });
            }
            it('LENGTH_LOWEST', () => __awaiter(this, void 0, void 0, function* () {
                yield checkLessThanMin(DataTestCase_1.DataTestCase.LENGTH_LOWEST);
            }));
            it('LENGTH_RANDOM_BELOW_MIN', () => __awaiter(this, void 0, void 0, function* () {
                yield checkLessThanMin(DataTestCase_1.DataTestCase.LENGTH_RANDOM_BELOW_MIN);
            }));
            it('LENGTH_JUST_BELOW_MIN', () => __awaiter(this, void 0, void 0, function* () {
                yield checkLessThanMin(DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MIN);
            }));
            it('LENGTH_MIN', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minLength = min;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.LENGTH_MIN, cfg);
                expect(val.length).toEqual(cfg.min);
            }));
            it('LENGTH_JUST_ABOVE_MIN', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minLength = min;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.LENGTH_JUST_ABOVE_MIN, cfg);
                expect(val.length).toBeGreaterThan(cfg.min);
            }));
            it('LENGTH_MEDIAN', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minLength = min;
                cfg.maxLength = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.LENGTH_MEDIAN, cfg);
                expect(val.length).toEqual(median);
            }));
            it('LENGTH_RANDOM_BETWEEN_MIN_MAX', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.minLength = min;
                cfg.maxLength = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX, cfg);
                expect(val.length).toBeGreaterThanOrEqual(cfg.min);
                expect(val.length).toBeLessThanOrEqual(cfg.max);
            }));
            it('LENGTH_JUST_BELOW_MAX', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.maxLength = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.LENGTH_JUST_BELOW_MAX, cfg);
                expect(val.length).toBeLessThan(cfg.max);
            }));
            it('LENGTH_MAX', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(vt);
                cfg.maxLength = max;
                const val = yield gen.generate(DataTestCase_1.DataTestCase.LENGTH_MAX, cfg);
                expect(val.length).toEqual(cfg.max);
            }));
            it('LENGTH_JUST_ABOVE_MAX', () => __awaiter(this, void 0, void 0, function* () {
                yield checkGreaterThanMax(DataTestCase_1.DataTestCase.LENGTH_JUST_ABOVE_MAX);
            }));
            it('LENGTH_RANDOM_ABOVE_MAX', () => __awaiter(this, void 0, void 0, function* () {
                yield checkGreaterThanMax(DataTestCase_1.DataTestCase.LENGTH_RANDOM_ABOVE_MAX);
            }));
            it('LENGTH_GREATEST', () => __awaiter(this, void 0, void 0, function* () {
                yield checkGreaterThanMax(DataTestCase_1.DataTestCase.LENGTH_GREATEST);
            }));
        };
    }
    function checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(vt, min, max) {
        return () => {
            function checkIsNull(tc) {
                return __awaiter(this, void 0, void 0, function* () {
                    let cfg = new DataGenerator_1.DataGenConfig(vt);
                    cfg.minLength = min;
                    cfg.maxLength = max;
                    const val = yield gen.generate(tc, cfg);
                    expect(val).toBeNull();
                });
            }
            function makeIt(tc) {
                it(tc.toString(), () => __awaiter(this, void 0, void 0, function* () {
                    yield checkIsNull(tc);
                }));
            }
            const testCases = (new DataTestCase_1.DataTestCaseGroupDef()).ofGroup(DataTestCase_1.DataTestCaseGroup.LENGTH);
            for (let tc of testCases) {
                makeIt(tc);
            }
        };
    }
    function numberComparator(a, b) {
        return a > b ? 1 : ((a < b) ? -1 : 0);
    }
    function dateComparator(a, b) {
        const v = a.compareTo(b);
        return v < 0 ? -1 : (v > 0 ? 1 : 0); // normalize to -1, 0, +1
    }
    function timeComparator(a, b) {
        const v = a.compareTo(b);
        return v < 0 ? -1 : (v > 0 ? 1 : 0); // normalize to -1, 0, +1
    }
    function dateTimeComparator(a, b) {
        const v = a.compareTo(b);
        return v < 0 ? -1 : (v > 0 ? 1 : 0); // normalize to -1, 0, +1
    }
    //
    // tests
    //
    describe('value', () => {
        describe('integer', checkTestCasesOfTheGroupValue(ValueTypeDetector_1.ValueType.INTEGER, 10, 20, 15, 0, numberComparator));
        describe('double', checkTestCasesOfTheGroupValue(ValueTypeDetector_1.ValueType.DOUBLE, 10, 20, 15, 0, numberComparator));
        describe('date', checkTestCasesOfTheGroupValue(ValueTypeDetector_1.ValueType.DATE, js_joda_1.LocalDate.of(2018, 1, 1), js_joda_1.LocalDate.of(2018, 1, 30), js_joda_1.LocalDate.of(2018, 1, 15), DateLimits_1.DateLimits.MIN, dateComparator));
        describe('time', checkTestCasesOfTheGroupValue(ValueTypeDetector_1.ValueType.TIME, js_joda_1.LocalTime.of(12, 0, 0), js_joda_1.LocalTime.of(13, 0, 0), js_joda_1.LocalTime.of(12, 30, 0), TimeLimits_1.TimeLimits.MIN, timeComparator));
        describe('datetime', checkTestCasesOfTheGroupValue(ValueTypeDetector_1.ValueType.DATETIME, js_joda_1.LocalDateTime.of(2018, 1, 1, 12, 0, 0), js_joda_1.LocalDateTime.of(2018, 1, 30, 13, 0, 0), js_joda_1.LocalDateTime.of(2018, 1, 15, 12, 30, 0), DateTimeLimits_1.DateTimeLimits.MIN, dateTimeComparator));
    });
    describe('length', () => {
        describe('string', checkTestCasesOfTheGroupLength(ValueTypeDetector_1.ValueType.STRING, 10, 20, 15));
        // describe( 'integer', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( ValueType.INTEGER, 10, 20 ) );
        // describe( 'double', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString( ValueType.DOUBLE, 10, 20 ) );
        // describe( 'date', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
        //     ValueType.DATE,
        //     LocalDate.of( 2018, 1, 1 ),
        //     LocalDate.of( 2018, 12, 31 )
        // ) );
        // describe( 'time', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
        //     ValueType.TIME,
        //     LocalTime.of( 6, 0, 0 ),
        //     LocalTime.of( 12, 0, 0 )
        // ) );
        // describe( 'datetime', checkTestCasesOfTheGroupLengthReturnNullWhenTypeIsNotString(
        //     ValueType.DATETIME,
        //     LocalDateTime.of( LocalDate.of( 2018, 1, 1 ), LocalTime.of( 6, 0, 0 ) ),
        //     LocalDateTime.of( LocalDate.of( 2018, 12, 31 ), LocalTime.of( 12, 0, 0 ) )
        // ) );
    });
    describe('format', () => {
        describe('string', () => {
            it('FORMAT_VALID', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(ValueTypeDetector_1.ValueType.STRING);
                cfg.format = '[a-z]{2,10}';
                const val = yield gen.generate(DataTestCase_1.DataTestCase.FORMAT_VALID, cfg);
                expect(val).toMatch(new RegExp(cfg.format));
            }));
            it('FORMAT_INVALID', () => __awaiter(this, void 0, void 0, function* () {
                let cfg = new DataGenerator_1.DataGenConfig(ValueTypeDetector_1.ValueType.STRING);
                cfg.format = '^[a-z]{2,10}$';
                const val = yield gen.generate(DataTestCase_1.DataTestCase.FORMAT_INVALID, cfg);
                expect(val).not.toMatch(new RegExp(cfg.format));
            }));
        });
    });
});
//# sourceMappingURL=DataGeneratorTest.spec.js.map