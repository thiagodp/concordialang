import { join } from "path";
import { EntityValueType, FileInfo } from "../../modules/ast";
import { FileProblemMapper } from "../../modules/error/FileProblemMapper";
import { AugmentedSpec } from "../../modules/req/AugmentedSpec";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { UIETestPlan } from "../../modules/testcase/UIETestPlan";
import { DataGenerator } from "../../modules/testdata/DataGenerator";
import { DataGeneratorBuilder } from "../../modules/testdata/DataGeneratorBuilder";
import { DataTestCase } from "../../modules/testdata/DataTestCase";
import { DTCAnalysisResult } from "../../modules/testdata/DataTestCaseAnalyzer";
import { UIElementValueGenerator, ValueGenContext } from "../../modules/testdata/UIElementValueGenerator";
import { SimpleCompiler } from "../SimpleCompiler";
import { LocalDate, LocalTime } from "@js-joda/core";

describe( 'UIElementValueGenerator', () => {

    let gen: UIElementValueGenerator; // under test

    const SEED = 'concordia';
    const LANGUAGE = 'pt';
    let dataGen: DataGenerator;
    let cp: SimpleCompiler;
    let bsa: BatchSpecificationAnalyzer;
    let spec: AugmentedSpec;
    let errors = [];

    beforeEach( () => {
        dataGen = new DataGenerator( new DataGeneratorBuilder( SEED ) );
        gen = new UIElementValueGenerator( dataGen );
        cp = new SimpleCompiler( LANGUAGE );
        bsa = new BatchSpecificationAnalyzer();
        spec = new AugmentedSpec();
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

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é 2'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.VALUE_MIN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBe( 2 );
        } );

        it( 'max value - integer', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor máximo é 10'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.VALUE_MAX, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBe( 10 );
        } );

        it( 'min value - date', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é 31/12/2020'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.VALUE_JUST_ABOVE_MIN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBeInstanceOf( LocalDate );
            expect( value.toString() ).toEqual( "2021-01-01" ); // VALUE_JUST_ABOVE_MIN
        } );

        it( 'min value - time', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é 23:58'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.VALUE_JUST_ABOVE_MIN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toBeInstanceOf( LocalTime );
            expect( value.toString() ).toEqual( "23:59" ); // VALUE_JUST_ABOVE_MIN
        } );


        it( 'min length', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento mínimo é 3'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.LENGTH_MIN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 3 );
        } );

        it( 'max length', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - comprimento máximo é 50'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.LENGTH_MAX, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 50 );
        } );


        it( 'min and max length', async () => {

            let doc1 = await cp.addToSpec(
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
                [ 'A:foo', new UIETestPlan( DataTestCase.LENGTH_MEDIAN, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 25 );
        } );


        it( 'format', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - formato é "[A-Z]{10}"'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.FORMAT_VALID, DTCAnalysisResult.VALID, [] ) ]
            ] );

            let values = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plans, values );
            const value = await gen.generate( 'foo', context, doc1, spec, errors );

            expect( errors ).toEqual( [] );
            expect( value ).toHaveLength( 10 );
        } );


        it( 'value - integer', async () => {

            let doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor é 123'
                ],
                { } as FileInfo
            );

            let plans = new Map( [
                [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
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

                    let doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toBe( 10 );
                } );

                it( 'random', async () => {

                    let doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30, 40, 50 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_RANDOM_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30, 40, 50 ] ).toContain( value );
                } );

                it( 'last', async () => {

                    let doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_LAST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toBe( 30 );
                } );


                it( 'not in', async () => {

                    let doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em [ 10, 20, 30 ]'
                        ],
                        { } as FileInfo
                    );

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_NOT_IN_SET, DTCAnalysisResult.INVALID, [] ) ]
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
                    doc1 = await cp.addToSpec(
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

                    await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );
                } );

                it( 'first', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 10 );
                } );

                it( 'last', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_LAST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 30 );
                } );

                it( 'random', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_RANDOM_ELEMENT, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30 ] ).toContain( value );
                } );

                it( 'not in', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_NOT_IN_SET, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 10, 20, 30 ] ).not.toContain( value );
                } );

            } );

        } );


        describe( 'constant in the query', () => {

            let doc1;

            beforeEach( async () => {
                doc1 = await cp.addToSpec(
                    spec,
                    [
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
                    ],
                    { } as FileInfo
                );

                await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );
            } );

            it( 'first', async () => {

                let plans = new Map( [
                    [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                ] );

                let values = new Map< string, EntityValueType >();
                let context = new ValueGenContext( plans, values );
                const value = await gen.generate( 'foo', context, doc1, spec, errors );

                expect( errors ).toEqual( [] );
                expect( value ).toEqual( 20 );
            } );

        } );


        describe( 'ui element in the query', () => {

            let doc1;

            beforeEach( async () => {
                doc1 = await cp.addToSpec(
                    spec,
                    [
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
                    ],
                    { } as FileInfo
                );

                await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );
            } );

            it( 'first', async () => {

                let plans = new Map( [
                    [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ],
                    [ 'A:bar', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                ] );

                let values = new Map< string, EntityValueType >();
                let context = new ValueGenContext( plans, values );
                const value = await gen.generate( 'foo', context, doc1, spec, errors );

                expect( errors ).toEqual( [] );
                expect( value ).toEqual( 20 );
            } );

        } );

    } );



    describe( 'database', () => {

        const dbPath = join( __dirname, '../db/users.json' );

        describe( 'value', () => {

            describe( 'string column', () => {

                let doc1;

                beforeEach( async () => {
                    doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em "SELECT name FROM [Users]"',
                            'Database: Users',
                            ' - type é "json"',
                            ' - path é "' + dbPath + '"'
                        ],
                        { } as FileInfo
                    );

                    await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );
                } );

                it( 'first', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 'Alice' );
                } );

                it( 'last', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_LAST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 'Jack' );
                } );

                it( 'random', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_RANDOM_ELEMENT, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 'Alice', 'Bob', 'Jack' ] ).toContain( value );
                } );

                it( 'not in', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_NOT_IN_SET, DTCAnalysisResult.INVALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( [ 'Alice', 'Bob', 'Jack' ] ).not.toContain( value );
                } );

            } );


            describe( 'constant in the query', () => {

                let doc1;

                beforeEach( async () => {
                    doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em "SELECT name FROM [Users] WHERE age = [age]"',
                            'Constants:',
                            ' - "age" é 16',
                            'Database: Users',
                            ' - type é "json"',
                            ' - path é "' + dbPath + '"'
                        ],
                        { } as FileInfo
                    );

                    await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );
                } );

                it( 'first', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 'Jack' ); // jack has age 16
                } );

            } );


            describe( 'ui element in the query', () => {

                let doc1;

                beforeEach( async () => {
                    doc1 = await cp.addToSpec(
                        spec,
                        [
                            'Feature: A',
                            'UI Element: foo',
                            ' - valor em "SELECT name FROM [Users] WHERE age = {bar}"',
                            'UI Element: bar',
                            ' - valor é 16',
                            'Database: Users',
                            ' - type é "json"',
                            ' - path é "' + dbPath + '"'
                        ],
                        { } as FileInfo
                    );

                    await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );
                } );

                it( 'first', async () => {

                    let plans = new Map( [
                        [ 'A:foo', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ],
                        [ 'A:bar', new UIETestPlan( DataTestCase.SET_FIRST_ELEMENT, DTCAnalysisResult.VALID, [] ) ]
                    ] );

                    let values = new Map< string, EntityValueType >();
                    let context = new ValueGenContext( plans, values );
                    const value = await gen.generate( 'foo', context, doc1, spec, errors );

                    expect( errors ).toEqual( [] );
                    expect( value ).toEqual( 'Jack' ); // jack has age 16
                } );

            } );

        } );

        describe( 'length', () => {

            it( 'min length', async () => {

                let doc1 = await cp.addToSpec(
                    spec,
                    [
                        'Feature: A',
                        'UI Element: foo',
                        ' - comprimento mínimo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                        'Database: Users',
                        ' - type is "json"',
                        ' - path is "' + dbPath + '"'
                    ],
                    { } as FileInfo
                );

                await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

                let plans = new Map( [
                    [ 'A:foo', new UIETestPlan( DataTestCase.LENGTH_MIN, DTCAnalysisResult.VALID, [] ) ]
                ] );

                let values = new Map< string, EntityValueType >();
                let context = new ValueGenContext( plans, values );
                const value = await gen.generate( 'foo', context, doc1, spec, errors );

                expect( errors ).toEqual( [] );
                expect( value ).toHaveLength( 16 );
            } );


            it( 'max length', async () => {

                let doc1 = await cp.addToSpec(
                    spec,
                    [
                        'Feature: A',
                        'UI Element: foo',
                        ' - comprimento máximo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                        'Database: Users',
                        ' - type is "json"',
                        ' - path is "' + dbPath + '"'
                    ],
                    { } as FileInfo
                );

                await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

                let plans = new Map( [
                    [ 'A:foo', new UIETestPlan( DataTestCase.LENGTH_MAX, DTCAnalysisResult.VALID, [] ) ]
                ] );

                let values = new Map< string, EntityValueType >();
                let context = new ValueGenContext( plans, values );
                const value = await gen.generate( 'foo', context, doc1, spec, errors );

                expect( errors ).toEqual( [] );
                expect( value ).toHaveLength( 16 );
            } );

        } );


        describe( 'min/max value', () => {

            it( 'min value', async () => {

                let doc1 = await cp.addToSpec(
                    spec,
                    [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor mínimo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                        'Database: Users',
                        ' - type is "json"',
                        ' - path is "' + dbPath + '"'
                    ],
                    { } as FileInfo
                );

                await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

                let plans = new Map( [
                    [ 'A:foo', new UIETestPlan( DataTestCase.VALUE_MIN, DTCAnalysisResult.VALID, [] ) ]
                ] );

                let values = new Map< string, EntityValueType >();
                let context = new ValueGenContext( plans, values );
                const value = await gen.generate( 'foo', context, doc1, spec, errors );

                expect( errors ).toEqual( [] );
                expect( value ).toBe( 16 );
            } );


            it( 'max value', async () => {

                let doc1 = await cp.addToSpec(
                    spec,
                    [
                        'Feature: A',
                        'UI Element: foo',
                        ' - valor máximo é "SELECT age FROM [Users] WHERE name = \'Jack\'"',
                        'Database: Users',
                        ' - type is "json"',
                        ' - path is "' + dbPath + '"'
                    ],
                    { } as FileInfo
                );

                await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

                let plans = new Map( [
                    [ 'A:foo', new UIETestPlan( DataTestCase.VALUE_MAX, DTCAnalysisResult.VALID, [] ) ]
                ] );

                let values = new Map< string, EntityValueType >();
                let context = new ValueGenContext( plans, values );
                const value = await gen.generate( 'foo', context, doc1, spec, errors );

                expect( errors ).toEqual( [] );
                expect( value ).toBe( 16 );
            } );

        } );


    } );


} );