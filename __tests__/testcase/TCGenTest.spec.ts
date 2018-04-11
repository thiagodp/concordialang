import { TCGen } from "../../modules/testcase/TCGen";
import { EnglishKeywordDictionary } from "../../modules/dict/EnglishKeywordDictionary";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { Compiler } from "../../modules/app/Compiler";
import { Spec } from "../../modules/ast/Spec";
import { RandomString } from "../../modules/testdata/random/RandomString";
import { Random } from "../../modules/testdata/random/Random";

describe( 'TCGenTest', () => {

    let gen: TCGen; // under test

    let compiler: SimpleCompiler;
    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    const validComment =  ' # valid: random';

    beforeEach( () => {
        compiler = new SimpleCompiler( LANGUAGE );
        gen = new TCGen( SEED );
    } );

    afterEach( () => {
        gen = null;
    } );

    it( 'fills a single UI literal with random value', () => {

        let spec = new Spec();
        let doc = compiler.addToSpec( spec, [
            'Feature: foo',
            'Scenario: foo',
            'Variant: foo',
            'Test Case: foo',
            '  Quando eu preencho <foo>'
        ] );

        let steps = gen.fillEventualUILiteralsWithoutValueWithRandomValue(
            doc.feature.testCases[ 0 ].sentences[ 0 ],
            compiler.langLoader.load( LANGUAGE ).keywords
        );

        const randomString = new RandomString( new Random( gen.seed ) );
        const randomValue = randomString.between( gen.minRandomStringSize, gen.maxRandomStringSize );

        expect( steps[ 0 ].content ).toEqual( 'Quando eu preencho <foo> com "' + randomValue + '"' + validComment );
    } );


    it( 'fills more than one UI literal with random value', () => {

        let spec = new Spec();
        let doc = compiler.addToSpec( spec, [
            'Feature: foo',
            'Scenario: foo',
            'Variant: foo',
            'Test Case: foo',
            '  Quando eu preencho <foo>, <bar>, and <baz>'
        ] );

        let steps = gen.fillEventualUILiteralsWithoutValueWithRandomValue(
            doc.feature.testCases[ 0 ].sentences[ 0 ],
            compiler.langLoader.load( LANGUAGE ).keywords
        );

        const randomString = new RandomString( new Random( gen.seed ) );
        const randomValue1 = randomString.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const randomValue2 = randomString.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const randomValue3 = randomString.between( gen.minRandomStringSize, gen.maxRandomStringSize );

        expect( steps[ 0 ].content ).toEqual( 'Quando eu preencho <foo> com "' + randomValue1 + '"' + validComment);
        expect( steps[ 1 ].content ).toEqual( 'E eu preencho <bar> com "' + randomValue2 + '"' + validComment );
        expect( steps[ 2 ].content ).toEqual( 'E eu preencho <baz> com "' + randomValue3 + '"' + validComment );
    } );


    it( 'keep UI literal as is when it has value', () => {

        let spec = new Spec();
        let doc = compiler.addToSpec( spec, [
            'Feature: foo',
            'Scenario: foo',
            'Variant: foo',
            'Test Case: foo',
            '  Quando eu preencho <foo> com "xoxo"'
        ] );

        let steps = gen.fillEventualUILiteralsWithoutValueWithRandomValue(
            doc.feature.testCases[ 0 ].sentences[ 0 ],
            compiler.langLoader.load( LANGUAGE ).keywords
        );

        expect( steps[ 0 ].content ).toEqual( 'Quando eu preencho <foo> com "xoxo"' );
    } );


    it( 'separates UI literals from UI Elements', () => {

        let spec = new Spec();
        let doc = compiler.addToSpec( spec, [
            'Feature: foo',
            'Scenario: foo',
            'Variant: foo',
            'Test Case: foo',
            '  Quando eu preencho <foo>, {bar}, <baz>, and {zoo}'
        ] );

        let steps = gen.fillEventualUILiteralsWithoutValueWithRandomValue(
            doc.feature.testCases[ 0 ].sentences[ 0 ],
            compiler.langLoader.load( LANGUAGE ).keywords
        );

        const randomString = new RandomString( new Random( gen.seed ) );
        const randomValue1 = randomString.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const randomValue2 = randomString.between( gen.minRandomStringSize, gen.maxRandomStringSize );

        expect( steps[ 0 ].content ).toEqual( 'Quando eu preencho <foo> com "' + randomValue1 + '"' + validComment );
        expect( steps[ 1 ].content ).toEqual( 'E eu preencho {bar}' );
        expect( steps[ 2 ].content ).toEqual( 'E eu preencho <baz> com "' + randomValue2 + '"' + validComment );
        expect( steps[ 3 ].content ).toEqual( 'E eu preencho {zoo}' );
    } );

} );