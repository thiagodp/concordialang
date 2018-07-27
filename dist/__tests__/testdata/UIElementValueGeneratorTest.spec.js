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
const UIElementValueGenerator_1 = require("../../modules/testdata/UIElementValueGenerator");
const SimpleCompiler_1 = require("../../modules/util/SimpleCompiler");
const Spec_1 = require("../../modules/ast/Spec");
const UIETestPlan_1 = require("../../modules/testcase/UIETestPlan");
const DataTestCase_1 = require("../../modules/testdata/DataTestCase");
const DataTestCaseAnalyzer_1 = require("../../modules/testdata/DataTestCaseAnalyzer");
const BatchSpecificationAnalyzer_1 = require("../../modules/semantic/BatchSpecificationAnalyzer");
const SpecFilter_1 = require("../../modules/selection/SpecFilter");
const path_1 = require("path");
const DataGenerator_1 = require("../../modules/testdata/DataGenerator");
const DataGeneratorBuilder_1 = require("../../modules/testdata/DataGeneratorBuilder");
describe('UIElementValueGeneratorTest', () => {
    let gen; // under test
    const SEED = 'concordia';
    const LANGUAGE = 'pt';
    let dataGen;
    let cp;
    let bsa;
    let spec;
    let errors = [];
    beforeEach(() => {
        dataGen = new DataGenerator_1.DataGenerator(new DataGeneratorBuilder_1.DataGeneratorBuilder(SEED));
        gen = new UIElementValueGenerator_1.UIElementValueGenerator(dataGen);
        cp = new SimpleCompiler_1.SimpleCompiler(LANGUAGE);
        bsa = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
        spec = new Spec_1.Spec();
        errors = [];
    });
    afterEach(() => {
        errors = [];
        spec = null;
        cp = null;
        bsa = null;
        gen = null;
    });
    describe('simple', () => {
        it('min value - integer', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - valor mínimo é 2'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.VALUE_MIN, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toBe(2);
        }));
        it('max value - integer', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - valor máximo é 10'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.VALUE_MAX, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toBe(10);
        }));
        it('min length', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - comprimento mínimo é 3'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.LENGTH_MIN, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toHaveLength(3);
        }));
        it('max length', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - comprimento máximo é 50'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.LENGTH_MAX, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toHaveLength(50);
        }));
        it('min and max length', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - comprimento mínimo é 20',
                ' - comprimento máximo é 30'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.LENGTH_MEDIAN, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toHaveLength(25);
        }));
        it('format', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - formato é "[A-Z]{10}"'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.FORMAT_VALID, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toHaveLength(10);
        }));
        it('value - integer', () => __awaiter(this, void 0, void 0, function* () {
            let doc1 = cp.addToSpec(spec, [
                'Feature: A',
                'UI Element: foo',
                ' - valor é 123'
            ], {});
            let plans = new Map([
                ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
            ]);
            let values = new Map();
            let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
            const value = yield gen.generate('foo', context, doc1, spec, errors);
            expect(errors).toEqual([]);
            expect(value).toBe(123);
        }));
    });
    describe('set', () => {
        describe('value', () => {
            describe('integer', () => {
                it('first', () => __awaiter(this, void 0, void 0, function* () {
                    let doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em [ 10, 20, 30 ]'
                    ], {});
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toBe(10);
                }));
                it('random', () => __awaiter(this, void 0, void 0, function* () {
                    let doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em [ 10, 20, 30, 40, 50 ]'
                    ], {});
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_RANDOM_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect([10, 20, 30, 40, 50]).toContain(value);
                }));
                it('last', () => __awaiter(this, void 0, void 0, function* () {
                    let doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em [ 10, 20, 30 ]'
                    ], {});
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_LAST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toBe(30);
                }));
                it('not in', () => __awaiter(this, void 0, void 0, function* () {
                    let doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em [ 10, 20, 30 ]'
                    ], {});
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_NOT_IN_SET, DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect([10, 20, 30]).not.toContain(value);
                }));
            });
        });
    });
    describe('query table', () => {
        describe('value', () => {
            describe('integer column', () => {
                let doc1;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em "SELECT x FROM [Minha Tabela]"',
                        'Tabela: Minha Tabela',
                        '| x   | y      |',
                        '| 10  | ten    |',
                        '| 20  | twenty |',
                        '| 30  | thirty |',
                    ], {});
                    yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                }));
                it('first', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toEqual(10);
                }));
                it('last', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_LAST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toEqual(30);
                }));
                it('random', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_RANDOM_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect([10, 20, 30]).toContain(value);
                }));
                it('not in', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_NOT_IN_SET, DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect([10, 20, 30]).not.toContain(value);
                }));
            });
        });
        describe('constant in the query', () => {
            let doc1;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                doc1 = cp.addToSpec(spec, [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor em "SELECT x FROM [Minha Tabela] WHERE y = [myY]"',
                    'Constants:',
                    ' - "myY" é "twenty"',
                    'Tabela: Minha Tabela',
                    '| x   | y      |',
                    '| 10  | ten    |',
                    '| 20  | twenty |',
                    '| 30  | thirty |',
                ], {});
                yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
            }));
            it('first', () => __awaiter(this, void 0, void 0, function* () {
                let plans = new Map([
                    ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                ]);
                let values = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                const value = yield gen.generate('foo', context, doc1, spec, errors);
                expect(errors).toEqual([]);
                expect(value).toEqual(20);
            }));
        });
        describe('ui element in the query', () => {
            let doc1;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                doc1 = cp.addToSpec(spec, [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor em "SELECT x FROM [Minha Tabela] WHERE y = {bar}"',
                    'UI Element: bar',
                    ' - valor é "twenty"',
                    'Tabela: Minha Tabela',
                    '| x   | y      |',
                    '| 10  | ten    |',
                    '| 20  | twenty |',
                    '| 30  | thirty |',
                ], {});
                yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
            }));
            it('first', () => __awaiter(this, void 0, void 0, function* () {
                let plans = new Map([
                    ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])],
                    ['A:bar', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                ]);
                let values = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                const value = yield gen.generate('foo', context, doc1, spec, errors);
                expect(errors).toEqual([]);
                expect(value).toEqual(20);
            }));
        });
    });
    describe('database', () => {
        const dbPath = path_1.join(__dirname, '../db/users.json');
        describe('value', () => {
            describe('string column', () => {
                let doc1;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em "SELECT name FROM [Users]"',
                        'Database: Users',
                        ' - type é "json"',
                        ' - path é "' + dbPath + '"'
                    ], {});
                    yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                }));
                it('first', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toEqual('Alice');
                }));
                it('last', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_LAST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toEqual('Jack');
                }));
                it('random', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_RANDOM_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(['Alice', 'Bob', 'Jack']).toContain(value);
                }));
                it('not in', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_NOT_IN_SET, DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(['Alice', 'Bob', 'Jack']).not.toContain(value);
                }));
            });
            describe('constant in the query', () => {
                let doc1;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em "SELECT name FROM [Users] WHERE age = [age]"',
                        'Constants:',
                        ' - "age" é 16',
                        'Database: Users',
                        ' - type é "json"',
                        ' - path é "' + dbPath + '"'
                    ], {});
                    yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                }));
                it('first', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toEqual('Jack'); // jack has age 16
                }));
            });
            describe('ui element in the query', () => {
                let doc1;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    doc1 = cp.addToSpec(spec, [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor em "SELECT name FROM [Users] WHERE age = {bar}"',
                        'UI Element: bar',
                        ' - valor é 16',
                        'Database: Users',
                        ' - type é "json"',
                        ' - path é "' + dbPath + '"'
                    ], {});
                    yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                }));
                it('first', () => __awaiter(this, void 0, void 0, function* () {
                    let plans = new Map([
                        ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])],
                        ['A:bar', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.SET_FIRST_ELEMENT, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                    ]);
                    let values = new Map();
                    let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                    const value = yield gen.generate('foo', context, doc1, spec, errors);
                    expect(errors).toEqual([]);
                    expect(value).toEqual('Jack'); // jack has age 16
                }));
            });
        });
        describe('length', () => {
            it('min length', () => __awaiter(this, void 0, void 0, function* () {
                let doc1 = cp.addToSpec(spec, [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento mínimo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                    'Database: Users',
                    ' - type is "json"',
                    ' - path is "' + dbPath + '"'
                ], {});
                yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                let plans = new Map([
                    ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.LENGTH_MIN, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                ]);
                let values = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                const value = yield gen.generate('foo', context, doc1, spec, errors);
                expect(errors).toEqual([]);
                expect(value).toHaveLength(16);
            }));
            it('max length', () => __awaiter(this, void 0, void 0, function* () {
                let doc1 = cp.addToSpec(spec, [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento máximo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                    'Database: Users',
                    ' - type is "json"',
                    ' - path is "' + dbPath + '"'
                ], {});
                yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                let plans = new Map([
                    ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.LENGTH_MAX, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                ]);
                let values = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                const value = yield gen.generate('foo', context, doc1, spec, errors);
                expect(errors).toEqual([]);
                expect(value).toHaveLength(16);
            }));
        });
        describe('min/max value', () => {
            it('min value', () => __awaiter(this, void 0, void 0, function* () {
                let doc1 = cp.addToSpec(spec, [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                    'Database: Users',
                    ' - type is "json"',
                    ' - path is "' + dbPath + '"'
                ], {});
                yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                let plans = new Map([
                    ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.VALUE_MIN, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                ]);
                let values = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                const value = yield gen.generate('foo', context, doc1, spec, errors);
                expect(errors).toEqual([]);
                expect(value).toBe(16);
            }));
            it('max value', () => __awaiter(this, void 0, void 0, function* () {
                let doc1 = cp.addToSpec(spec, [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor máximo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                    'Database: Users',
                    ' - type is "json"',
                    ' - path is "' + dbPath + '"'
                ], {});
                yield bsa.analyze(new SpecFilter_1.SpecFilter(spec).graph(), spec, errors);
                let plans = new Map([
                    ['A:foo', new UIETestPlan_1.UIETestPlan(DataTestCase_1.DataTestCase.VALUE_MAX, DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID, [])]
                ]);
                let values = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plans, values);
                const value = yield gen.generate('foo', context, doc1, spec, errors);
                expect(errors).toEqual([]);
                expect(value).toBe(16);
            }));
        });
    });
});
