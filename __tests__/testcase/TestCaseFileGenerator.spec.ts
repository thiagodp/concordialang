import { resolve } from "path";

import { JsonLanguageContentLoader, LanguageContentLoader } from "../../modules/dict";
import { Document } from '../../modules/ast/Document';
import { TestCaseFileGenerator } from "../../modules/testcase/TestCaseFileGenerator";
import { Options } from "../../modules/app/Options";
import { FileData, FileMeta } from "../../modules/app/SingleFileProcessor";
import { SingleFileCompiler } from "../../modules/app/SingleFileCompiler";
import { LexerBuilder } from "../../modules/lexer/LexerBuilder";
import { Parser } from "../../modules/parser/Parser";
import { NLPBasedSentenceRecognizer } from "../../modules/nlp/NLPBasedSentenceRecognizer";
import { NLPTrainer } from "../../modules/nlp/NLPTrainer";

describe( 'TestCaseFileGenerator', () => {

    const LANGUAGE = 'en';
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );

    let sfc = new SingleFileCompiler(
        ( new LexerBuilder() ).build( options, LANGUAGE ),
        new Parser(),
        new NLPBasedSentenceRecognizer( new NLPTrainer( langLoader ) ),
        LANGUAGE,
        true // <<< Semantic analysis ignored
    );

    // utility
    async function check(
        input: string[],
        language: string = LANGUAGE,
        expected?: string[]
    ) {

        let result = await sfc.process(
            new FileData(
                new FileMeta( './fake.testcase', 100, 'fake-hash' ),
                input.join( "\n" )
            ),
            "\n"
        );
        expect( result.errors ).toHaveLength( 0 );

        let errors = result.errors;
        let doc: Document = result.content as Document;

        const gen = new TestCaseFileGenerator( langLoader, language ); // under test

        const output: string[] = gen.createLinesFromDoc( doc, errors, true )
                .map( s => s.toLowerCase() );

        const wanted: string[] = ( expected || input ).map( s => s.toLowerCase() );

        expect( output ).toEqual( wanted );
    }

    // ENGLISH

    it( 'generates basic lines in english', async () => {

        const input: string[] = [
            'import "fake.feature"',
            '',
            'test case: foo'
        ];

        await check( input, 'en' );
    } );

    it( 'generates with a single test case', async () => {

        const input: string[] = [
            'import "fake.feature"',
            '',
            'test case: foo',
            '  given that I see the url "http://localhost/foo"',
            '  when I click <register>',
            '  then I see "Register"',
            '    and I see the url "http://localhost/foo/register"'
        ];

        await check( input, 'en' );
    } );


    it( 'generates with more than one test case', async () => {

        const input: string[] = [
            'import "fake.feature"',
            '',
            'test case: foo',
            '  given that I see the url "http://localhost/foo"',
            '  when I click <register>',
            '  then I see "Register"',
            '    and I see the url "http://localhost/foo/register"',
            '',
            'test case: bar',
            '  given that I see the url "http://localhost/bar"',
            '    and I see "Bar"',
            '    and I don\'t see "Foo"',
            '  when I click <menu>',
            '    and I click <login>',
            '  then I see "Login"',
            '    and I see the url "http://localhost/foo/login"'
        ];

        await check( input, 'en' );
    } );


    // PORTUGUESE


    it( 'generates basic lines in portuguse', async () => {

        const input: string[] = [
            'import "fake.feature"',
            '',
            'test case: foo'
        ];

        const expected: string[] = [
            'importe "fake.feature"',
            '',
            'caso de teste: foo'
        ];

        await check( input, 'pt', expected );
    } );


    it( 'generates with a single test case in portuguese', async () => {

        const input: string[] = [
            '#language:pt',
            '',
            'importe "fake.feature"',
            '',
            'caso de teste: foo',
            '  dado que eu vejo a url "http://localhost/foo"',
            '  quando clico em <register>',
            '  então eu vejo "Register"',
            '    e eu vejo a url "http://localhost/foo/register"'
        ];

        await check( input, 'pt' );
    } );


    it( 'generates with more than one test case in portuguese', async () => {

        const input: string[] = [
            '#language:pt',
            '',
            'importe "fake.feature"',
            '',
            'caso de teste: foo',
            '  dado que eu vejo a url "http://localhost/foo"',
            '  quando clico em <register>',
            '  então eu vejo "Register"',
            '    e eu vejo a url "http://localhost/foo/register"',
            '',
            'caso de teste: bar',
            '  dado que eu vejo a url "http://localhost/bar"',
            '    e eu vejo "Bar"',
            '    e eu não vejo "Foo"',
            '  quando eu clico em <menu>',
            '    e eu clico em <login>',
            '  então eu vejo "Login"',
            '    e eu vejo a url "http://localhost/foo/login"'
        ];

        await check( input, 'pt' );
    } );

} );