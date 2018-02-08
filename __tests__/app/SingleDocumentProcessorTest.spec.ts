import { DatabaseWrapper } from '../../modules/db/DatabaseWrapper';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { SingleDocumentProcessor } from '../../modules/app/SingleDocumentProcessor';
import { Parser } from '../../modules/parser/Parser';
import { Lexer } from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import { Defaults } from '../../modules/app/Defaults';
import { resolve } from 'path';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Options } from '../../modules/app/Options';
import { LanguageContentLoader, JsonLanguageContentLoader } from '../../modules/dict/LanguageContentLoader';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'SingleDocumentProcessorTest', () => {
    
    const LANGUAGE = 'pt';

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );

    let lexer: Lexer = ( new LexerBuilder( langLoader ) ).build( options, LANGUAGE );

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