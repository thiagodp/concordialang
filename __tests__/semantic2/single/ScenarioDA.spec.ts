import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../../modules/app/Options';
import { Document } from '../../../modules/ast/Document';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Lexer } from '../../../modules/lexer/Lexer';
import { Parser } from '../../../modules/parser/Parser';
import { ScenarioDA } from '../../../modules/semantic2/single/ScenarioDA';
import { FSFileHandler } from '../../../modules/util/file/FSFileHandler';

describe( 'ScenarioDA', () => {

    const analyzer = new ScenarioDA(); // under test

    let parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );
    const lexer: Lexer = new Lexer( options.language, langLoader );


    beforeEach( () => {
        lexer.reset();
    } );

    it( 'does not criticize when it is all right', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 2'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        let errors = [];
        analyzer.analyze( doc1, errors );
        expect( errors ).toHaveLength( 0 );
    } );


    it( 'criticizes duplicated names', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 1'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        let errors: Error[] = [];
        analyzer.analyze( doc1, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );