import { UIElementValueGenerator, ValueGenContext } from "../../modules/testdata/UIElementValueGenerator";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { Spec } from "../../modules/ast/Spec";
import { FileInfo } from "../../modules/ast/FileInfo";
import { UIETestPlan } from "../../modules/testcase/UIETestPlan";
import { DataTestCase } from "../../modules/testdata/DataTestCase";
import { DTCAnalysisResult } from "../../modules/testdata/DataTestCaseAnalyzer";
import { EntityValueType } from "../../modules/ast/UIElement";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { join } from "path";

describe( 'UIElementValueGeneratorTest', () => {

    let gen: UIElementValueGenerator; // under test

    const SEED = 'concordia';
    const LANGUAGE = 'pt';
    let cp: SimpleCompiler;
    let bsa: BatchSpecificationAnalyzer;
    let spec: Spec;
    let errors: Error[] = [];

    beforeEach( () => {
        gen = new UIElementValueGenerator( SEED );
        cp = new SimpleCompiler( LANGUAGE );
        bsa = new BatchSpecificationAnalyzer();
        spec = new Spec();
        errors = [];
    } );

    afterEach( () => {
        errors = [];
        spec = null;
        cp = null;
        bsa = null;
        gen = null;
    } );

    describe( 'simple', () => {

        it( 'min value - integer', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é 2'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.VALUE_MIN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBe( 2 );
        } );

        it( 'max value - integer', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor máximo é 10'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.VALUE_MAX, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBe( 10 );
        } );

        it( 'min length', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento mínimo é 3'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.LENGTH_MIN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 3 );
        } );

        it( 'max length', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento máximo é 50'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.LENGTH_MAX, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 50 );
        } );


        it( 'min and max length', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento mínimo é 20',
                    ' - comprimento máximo é 30'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.LENGTH_MEDIAN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 25 );
        } );


        it( 'format', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - formato é "[A-Z]{10}"'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.FORMAT_VALID, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 10 );
        } );


        it( 'value - integer', async () => {

            let doc1 = cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor é 123'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBe( 123 );
        } );

    });


    describe( 'set', () => {

        describe( 'value', () => {

            describe( 'integer', () => {

                it( 'first', async () => {

                    let doc1 = cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toBe( 10 );
                } );

                it( 'random', async () => {

                    let doc1 = cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30, 40, 50 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_RANDOM_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30, 40, 50 ] ).toContain( value );
                } );

                it( 'last', async () => {

                    let doc1 = cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_LAST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toBe( 30 );
                } );


                it( 'not in', async () => {

                    let doc1 = cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_NOT_IN_SET, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30 ] ).not.toContain( value );
                } );

            } );

        } );

    } );


    describe( 'query table', () => {

        describe( 'value', () => {

            describe( 'integer column', () => {

                let doc1;

                beforeEach( async () => {
                    doc1 = cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em "SELECT x FROM [Minha Tabela]"',
                            'Tabela: Minha Tabela',
                            '| x   | y      |',
                            '| 10  | ten    |',
                            '| 20  | twenty |',
                            '| 30  | thirty |',
                        ],
                        { } as FileInfo
                    );

                    await bsa.analyze( new SpecFilter( spec ).graph(), spec, errors );
                } );

                it( 'first', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 10 );
                } );

                it( 'last', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_LAST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 30 );
                } );

                it( 'random', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_RANDOM_ELEMENT, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30 ] ).toContain( value );
                } );

                it( 'not in', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_NOT_IN_SET, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30 ] ).not.toContain( value );
                } );

            } );

        } );

    } );



    describe( 'database', () => {

        const dbPath = join( __dirname, '../db/users.json' );

        describe( 'value', () => {

            describe( 'string column', () => {

                let doc1;

                beforeEach( async () => {
                    doc1 = cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em "SELECT name FROM [Users]"',
                            'Database: Users',
                            ' - type is "json"',
                            ' - path is "' + dbPath + '"'
                        ],
                        { } as FileInfo
                    );

                    await bsa.analyze( new SpecFilter( spec ).graph(), spec, errors );
                } );

                it( 'first', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 'Alice' );
                } );

                it( 'last', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_LAST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 'Jack' );
                } );

                it( 'random', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_RANDOM_ELEMENT, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 'Alice', 'Bob', 'Jack' ] ).toContain( value );
                } );

                it( 'not in', async () => {

                    let plans = new Map( [
                        [ 'foo', new UIETestPlan( DataTestCase.SET_NOT_IN_SET, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 'Alice', 'Bob', 'Jack' ] ).not.toContain( value );
                } );

            } );

        } );

    } );


} );