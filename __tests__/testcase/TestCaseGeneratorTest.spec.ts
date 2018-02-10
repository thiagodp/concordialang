import { LanguageContentLoader, JsonLanguageContentLoader } from '../../modules/dict/LanguageContentLoader';
import { Options } from '../../modules/app/Options';
import { TestCaseGenerator } from "../../modules/testcase/TestCaseGenerator";
import { Template } from "../../modules/ast/Variant";
import { DataTestCase } from "../../modules/testdata/DataTestCase";
import { SingleDocumentProcessor } from "../../modules/app/SingleDocumentProcessor";
import { Document } from '../../modules/ast/Document';
import { resolve } from 'path';
import { Lexer } from '../../modules/lexer/Lexer';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';
import { Parser } from '../../modules/parser/Parser';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { Spec } from '../../modules/ast/Spec';
import { CaseType } from '../../modules/app/CaseType';
import { Tag } from '../../modules/ast/Tag';

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

    it( 'adds a name correctly', () => {
        let content = [];
        gen.addName( content, { name: 'Foo' } as Template, 'Variant', DataTestCase.VALUE_MIN );
        expect( content[ 0 ] ).toEqual( 'Variant: Foo - ' + DataTestCase.VALUE_MIN );
    } );


    it( 'add tags correctly', () => {

        const template: Template = {
            tags: [
                { name: "important" } as Tag
            ],
            name: "Foo Bar",
            sentences: []
        } as Template;

        let content: string[] = [];
        gen.addTags( content, template );

        expect( content ).toEqual( [
            '@generated',
            '@template(Foo Bar)',
            '@important'
        ] );

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
                'Template: Foo',
                '  Dado que eu estou escrevendo um template',
                '  Quando eu preencho "a" com [ipsum]',
                '    E eu preencho "b" com [pi]'       
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let template = doc2.feature.scenarios[ 0 ].templates[ 0 ];
        let newTemplate = gen.replaceReferences( template, doc2.feature.uiElements, spec, CaseType.CAMEL );

        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "a" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "b" com 3.1416' );
    } );



    it( 'replaces references to ui elements', () => {

        let spec = new Spec( '.' );

        let doc: Document = addToSpec( spec, 
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Template: Foo',
                '  Dado que eu estou escrevendo um template',
                '  Quando eu preencho {A} com "ipsum lorem"',
                '    E eu preencho {B} com 3.1416',
                'UI Element: A',
                ' - id é "ax"',
                'UI Element: B',
                ' - id é "bx"'                
            ] );

        expect( doc.fileErrors ).toEqual( [] );

        let template = doc.feature.scenarios[ 0 ].templates[ 0 ];
        let newTemplate = gen.replaceReferences( template, doc.feature.uiElements, spec, CaseType.CAMEL );

        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "ax" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "bx" com 3.1416' );
    } );



    it( 'replaces references to ui elements with their names when an id is not found', () => {

        let spec = new Spec( '.' );

        let doc: Document = addToSpec( spec, 
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Template: Foo',
                '  Dado que eu estou escrevendo um template',
                '  Quando eu preencho {Primeiro Campo} com "ipsum lorem"',
                '    E eu preencho {Segundo Campo} com 3.1416',
                'UI Element: Primeiro Campo',
                'UI Element: Segundo Campo'
            ] );

        expect( doc.fileErrors ).toEqual( [] );

        let template = doc.feature.scenarios[ 0 ].templates[ 0 ];

        // NONE case
        let newTemplate = gen.replaceReferences( template, doc.feature.uiElements, spec, CaseType.NONE );
        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "Primeiro Campo" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "Segundo Campo" com 3.1416' );

        // CAMEL case
        newTemplate = gen.replaceReferences( template, doc.feature.uiElements, spec, CaseType.CAMEL );
        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "primeiroCampo" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "segundoCampo" com 3.1416' );

        // PASCAL case
        newTemplate = gen.replaceReferences( template, doc.feature.uiElements, spec, CaseType.PASCAL );
        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "PrimeiroCampo" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "SegundoCampo" com 3.1416' );

        // KEBAB case (aka dashed)
        newTemplate = gen.replaceReferences( template, doc.feature.uiElements, spec, CaseType.KEBAB );
        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "primeiro-campo" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "segundo-campo" com 3.1416' );

        // SNAKE case
        newTemplate = gen.replaceReferences( template, doc.feature.uiElements, spec, CaseType.SNAKE );
        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "primeiro_campo" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "segundo_campo" com 3.1416' );
    } );    



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
                'Template: Foo',
                '  Dado que eu estou escrevendo um template',
                '  Quando eu preencho {A} com [ipsum]',
                '    E eu preencho {B} com [pi]',
                'UI Element: A',
                ' - id é "ax"',
                'UI Element: B',
                ' - id é "bx"'                
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let template = doc2.feature.scenarios[ 0 ].templates[ 0 ];
        let newTemplate = gen.replaceReferences( template, doc2.feature.uiElements, spec, CaseType.CAMEL );

        expect( newTemplate.sentences[ 1 ].content ).toEqual( 'Quando eu preencho "ax" com "ipsum lorem"' );
        expect( newTemplate.sentences[ 2 ].content ).toEqual( 'E eu preencho "bx" com 3.1416' );
    } );



    it( 'adds sentences with generated values', () => {

        let spec = new Spec( '.' );

        let doc: Document = addToSpec( spec, 
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Template: Foo',
                '  Dado que eu estou escrevendo um template',
                '  Quando eu preencho {A}',
                '    E eu preencho {B}',
                'UI Element: A',
                'UI Element: B',
                ' - tipo de dado é inteiro',
                ' - obrigatório'
            ] );

        expect( doc.fileErrors ).toEqual( [] );

        let template = doc.feature.scenarios[ 0 ].templates[ 0 ];
        //console.log( 'template sentences', template.sentences );
        let sentences: string[] = [];

        gen.addSentencesWithGeneratedValues(
            sentences,
            template.sentences,
            doc.feature.uiElements,
            spec,
            DataTestCase.LENGTH_LOWEST,
            'com'
        );

        expect( sentences ).toHaveLength( 3 );
        expect( sentences[ 0 ].trim() ).toEqual( 'Dado que eu estou escrevendo um template' );
        expect( sentences[ 1 ].trim() ).toEqual( 'Quando eu preencho {A} com ""' );
        expect( sentences[ 2 ].trim() ).toEqual( 'E eu preencho {B} com ""' );
    } );

} );