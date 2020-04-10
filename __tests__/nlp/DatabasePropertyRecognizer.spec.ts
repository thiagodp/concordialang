import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../modules/app/Options';
import { DatabaseProperty } from '../../modules/ast';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { DatabasePropertyRecognizer, NLP, NLPTrainer } from '../../modules/nlp';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';

describe( 'DatabasePropertyRecognizer', () => {

    let nodes = [];
    let errors = [];
    let warnings = [];

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );

    // helper
    function makeNode( content: string, line = 1, column = 1 ): DatabaseProperty {
        return {
            nodeType: NodeTypes.DATABASE_PROPERTY ,
            location: { line: line, column: column },
            content: content
        } as DatabaseProperty;
    }

   describe( 'In Portuguese', () => {

        const LANGUAGE = 'pt';
        let nlp = new NLP();
        let rec = new DatabasePropertyRecognizer( nlp ); // under test
        let nlpTrainer = new NLPTrainer( langLoader );
        rec.trainMe( nlpTrainer, LANGUAGE );

        function shouldRecognize( sentence: string, property: string, value: string ): void {

            nodes = [];
            errors = [];
            warnings = [];

            let node = makeNode( sentence );
            nodes.push( node );

            rec.recognizeSentences( LANGUAGE, nodes, errors, warnings );
            expect( errors ).toHaveLength( 0 );
            expect( warnings ).toHaveLength( 0 );

            expect( node.property ).toBe( property );
            expect( node.value ).toEqual( value );
        }

        it( 'recognizes type', () => {
            shouldRecognize( 'tipo é "mysql"', 'type', 'mysql' );
            shouldRecognize( 'type é "mysql"', 'type', 'mysql' );
        } );

        it( 'recognizes path', () => {
            shouldRecognize( 'caminho é "path/to/db"', 'path', 'path/to/db' );
            shouldRecognize( 'path é "path/to/db"', 'path', 'path/to/db' );

            shouldRecognize( 'nome é "mydb"', 'path', 'mydb' );
            shouldRecognize( 'name é "mydb"', 'path', 'mydb' );
        } );

    } );

} );