import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../modules/app/Options';
import { SingleDocumentProcessor } from '../../modules/app/SingleDocumentProcessor';
import { Document } from '../../modules/ast/Document';
import { JsonLanguageContentLoader, LanguageContentLoader, EnglishKeywordDictionary } from '../../modules/dict';
import { Lexer } from '../../modules/lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Parser } from '../../modules/parser/Parser';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';

describe( 'SingleDocumentProcessor', () => {

    const LANGUAGE = 'pt';

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );

    let lexer: Lexer = new Lexer( LANGUAGE, langLoader );

    let parser = new Parser();

    let nlpTrainer = new NLPTrainer( langLoader );
    let nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

    let singleDocProcessor: SingleDocumentProcessor = new SingleDocumentProcessor();

    let analyze = ( doc, lexer ) => {
        singleDocProcessor.analyzeNodes( doc, lexer, parser, nlpRec, LANGUAGE );
    };


    it( 'is able to recognize a defined database', () => {
        [
            'Banco de dados: acme',
            '- tipo é "mysql"',
            '- host é "127.0.0.2"',
            '- username é "root"',
            '- password é ""',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {};

        analyze( doc, lexer );
        expect( doc.fileErrors ).toHaveLength( 0 );
        expect( doc.databases ).toHaveLength( 1 );
    } );

} );