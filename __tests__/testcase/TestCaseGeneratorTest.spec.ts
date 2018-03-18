import { LanguageContentLoader, JsonLanguageContentLoader } from '../../modules/dict/LanguageContentLoader';
import { Options } from '../../modules/app/Options';
import { TestCaseGenerator } from "../../modules/testcase/TestCaseGenerator";
import { DataTestCase } from "../../modules/testdata/DataTestCase";
import { SingleDocumentProcessor } from "../../modules/app/SingleDocumentProcessor";
import { Document } from '../../modules/ast/Document';
import { Lexer } from '../../modules/lexer/Lexer';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';
import { Parser } from '../../modules/parser/Parser';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { Spec } from '../../modules/ast/Spec';
import { CaseType } from '../../modules/app/CaseType';
import { Tag } from '../../modules/ast/Tag';
import { UIElementPropertyExtractor } from '../../modules/util/UIElementPropertyExtractor';
import { LocatedException } from '../../modules/req/LocatedException';
import { Warning } from '../../modules/req/Warning';
import { Variant } from '../../modules/ast/Variant';
import { resolve } from 'path';


describe( 'TestCaseGeneratorTest', () => {

    let gen: TestCaseGenerator = new TestCaseGenerator(); // under test

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );

    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );

    const LANGUAGE = 'pt';
    const lexer: Lexer = ( new LexerBuilder( langLoader ) ).build( options, LANGUAGE );

    const parser = new Parser();

    const nlpTrainer = new NLPTrainer( langLoader );
    const nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

    const singleDocProcessor: SingleDocumentProcessor = new SingleDocumentProcessor();

    function addToSpec( spec: Spec, lines: string[] ): Document {
        lines.forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {} as Document;
        singleDocProcessor.analyzeNodes( doc, lexer, parser, nlpRec, LANGUAGE );
        spec.docs.push( doc );
        return doc;
    }

    //
    // TESTS
    //

    it( 'add tags correctly', () => {

        const variant: Variant = {
            tags: [ {
                name: "importance",
                content: "9",
                location: {
                    column: 1,
                    line: 1
                }
            } as Tag
            ],
            name: "Foo Bar",
            sentences: []
        } as Variant;

        const tags: Tag[] = gen.createTags( variant, 1, true, [], [] );
        const names: string[] = tags.map( t => t.name );
        const contents: string[] = tags.map( t => t.content );
        const lines: number[] = tags.map( t => t.location.line );

        expect( names ).toEqual( [
            'generated',
            'importance',
            'variant'
        ] );

        expect( contents ).toEqual( [
            undefined,
            "9",
            "Foo Bar"
        ] );

        expect( lines ).toEqual( [ 1, 2, 3 ] );

    } );


    it( 'replaces references to constants', () => {

        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Constantes:',
                ' - "ipsum" é "ipsum lorem"',
                ' - "pi" é 3.1416'
            ] );

        let doc2: Document = addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Variant: Foo',
                '  Dado que espero ter ~foo~',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let errors: LocatedException[] = [];
        let warnings: Warning[] = [];

        let newVariant = gen.replaceReferences(
            variant,
            spec,
            doc2,
            CaseType.CAMEL,
            errors,
            warnings
        );

        expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <a> com "ipsum lorem"' );
        expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <b> com 3.1416' );
    } );



    it( 'replaces references to ui elements', () => {

        let spec = new Spec( '.' );

        let doc: Document = addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Variant: Foo',
                '  Dado que espero ter ~foo~',
                '  Quando eu preencho {A} com "ipsum lorem"',
                '    E eu preencho {B} com 3.1416',
                'UI Element: A',
                ' - id é "ax"',
                'UI Element: B',
                ' - id é "bx"'
            ] );

        expect( doc.fileErrors ).toEqual( [] );

        let variant = doc.feature.scenarios[ 0 ].variants[ 0 ];
        let errors: LocatedException[] = [];
        let warnings: Warning[] = [];

        let newVariant = gen.replaceReferences(
            variant,
            spec,
            doc,
            CaseType.CAMEL,
            errors,
            warnings
        );

        expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <ax> com "ipsum lorem"' );
        expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <bx> com 3.1416' );
    } );


    // Helper function
    let replacesForDifferentStringCases = ( lines: string[] ) => {

        return () => {

            let spec = new Spec( '.' );
            let doc: Document = addToSpec( spec, lines );
            expect( doc.fileErrors ).toEqual( [] );

            let variant = doc.feature.scenarios[ 0 ].variants[ 0 ];
            let errors: LocatedException[] = [];
            let warnings: Warning[] = [];

            beforeEach( () => {
                errors = [];
                warnings = [];
            } );


            it( 'same name', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.NONE,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <Primeiro Campo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <Segundo Campo> com 3.1416' );
            } );

            it( 'in camel case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.CAMEL,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <primeiroCampo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <segundoCampo> com 3.1416' );
            } );

            it( 'in pascal case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.PASCAL,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <PrimeiroCampo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <SegundoCampo> com 3.1416' );
            } );

            it( 'in kebab (aka dashed) case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.KEBAB,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <primeiro-campo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <segundo-campo> com 3.1416' );
            } );

            it( 'in snake case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.SNAKE,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <primeiro_campo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <segundo_campo> com 3.1416' );
            } );

        };
    };


    describe( 'replaces with the UI Element name when the id property is not declared',
        replacesForDifferentStringCases( [
            '#language:pt',
            'Feature: Feature 2',
            'Scenario: Foo',
            'Variant: Foo',
            '  Dado que espero ter ~foo~',
            '  Quando eu preencho {Primeiro Campo} com "ipsum lorem"',
            '    E eu preencho {Segundo Campo} com 3.1416',
            'UI Element: Primeiro Campo',
            'UI Element: Segundo Campo'
        ] )
    );


    describe( 'generates a UI Element name from the sentence when it is not declared',
        replacesForDifferentStringCases( [
            '#language:pt',
            'Feature: Feature 2',
            'Scenario: Foo',
            'Variant: Foo',
            '  Dado que espero ter ~foo~',
            '  Quando eu preencho {Primeiro Campo} com "ipsum lorem"',
            '    E eu preencho {Segundo Campo} com 3.1416'
            // NO UIElements !!!
        ] )
    );



    it( 'replaces both references to ui elements and constants', () => {

        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Constantes:',
                ' - "ipsum" é "ipsum lorem"',
                ' - "pi" é 3.1416'
            ] );

        let doc2: Document = addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Variant: Foo',
                '  Dado que espero ter ~foo~',
                '  Quando eu preencho {A} com [ipsum]',
                '    E eu preencho {B} com [pi]',
                'UI Element: A',
                ' - id é "ax"',
                'UI Element: B',
                ' - id é "bx"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let errors: LocatedException[] = [];
        let warnings: Warning[] = [];

        let newVariant = gen.replaceReferences(
            variant,
            spec,
            doc2,
            CaseType.CAMEL,
            errors,
            warnings
        );

        expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <ax> com "ipsum lorem"' );
        expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <bx> com 3.1416' );
    } );


} );