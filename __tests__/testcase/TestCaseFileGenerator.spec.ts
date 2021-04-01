import * as fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import { DEFAULT_DIR_LANGUAGE } from '../../modules/app/default-options';
import { SingleFileCompiler } from '../../modules/compiler/SingleFileCompiler';
import { FileProblemMapper } from '../../modules/error';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { Lexer } from '../../modules/lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Parser } from '../../modules/parser/Parser';
import { TestCaseFileGenerator } from '../../modules/testcase/TestCaseFileGenerator';
import { FSFileHandler } from '../../modules/util/fs/FSFileHandler';

describe( 'TestCaseFileGenerator', () => {

    const LANGUAGE = 'en';
	const dir = resolve( process.cwd(), 'dist/' );
	const langDir = resolve( dir, DEFAULT_DIR_LANGUAGE );

    const fileHandler = new FSFileHandler( fs, promisify );
    const langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        langDir,
        {},
        fileHandler,
        fileHandler
        );

    let sfc = new SingleFileCompiler(
        new Lexer( LANGUAGE, langLoader ),
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

        const problems = new FileProblemMapper();

        const doc = await sfc.process(
            problems,
            './fake.testcase',
            input.join( "\n" ),
            "\n"
        );

        const errors = problems.getAllErrors();
        expect( errors ).toHaveLength( 0 );

        const gen = new TestCaseFileGenerator( langLoader, language ); // under test

        const output: string[] = gen.createLinesFromDoc( doc, errors, true )
                .map( s => s.toLowerCase() );

        const wanted: string[] = ( expected || input ).map( s => s.toLowerCase() );

        expect( output ).toEqual( wanted );
    }


    describe( 'english', () => {

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

    } );


    describe( 'portuguese', () => {

        it( 'generates basic lines in portuguese', async () => {

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

} );
