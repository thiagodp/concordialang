import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../modules/app/Options';
import { SingleFileCompiler } from '../../modules/compiler/SingleFileCompiler';
import { Document } from '../../modules/ast/Document';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { Lexer } from '../../modules/lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Parser } from '../../modules/parser/Parser';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';
import { ProblemMapper, FileProblemMapper } from '../../modules/error';

describe( 'SingleFileCompiler', () => {

    const LANGUAGE = 'pt';

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );

    const lexer: Lexer = new Lexer( LANGUAGE, langLoader );

    const parser = new Parser();

    const nlpTrainer = new NLPTrainer( langLoader );
    const nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

    const singleDocProcessor: SingleFileCompiler = new SingleFileCompiler(
        lexer, parser, nlpRec, LANGUAGE
    );

    const analyze = ( doc ): Error[] => {
        const problems = new FileProblemMapper();
        singleDocProcessor.analyzeNodes( problems, doc );
        return problems.getAllErrors();
    };


    it( 'recognizes a database', () => {
        [
            'Banco de dados: acme',
            '- tipo é "mysql"',
            '- host é "127.0.0.2"',
            '- username é "root"',
            '- password é ""',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {};

        const errors = analyze( doc );
        expect( errors ).toHaveLength( 0 );
        expect( doc.databases ).toHaveLength( 1 );
    } );

} );