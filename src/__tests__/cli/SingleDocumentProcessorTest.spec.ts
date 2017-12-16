import { DatabaseWrapper } from '../../modules/data-gen/db/DatabaseWrapper';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { SingleDocumentProcessor } from '../../modules/cli/SingleDocumentProcessor';
import { Parser } from '../../modules/parser/Parser';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { Lexer } from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import { JsonKeywordDictionaryLoader } from '../../modules/dict/JsonKeywordDictionaryLoader';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'SingleDocumentProcessorTest', () => {
    
    const LANGUAGE = 'pt';

    let dictMap = { 'en': new EnglishKeywordDictionary() };
    
    let dictLoader: KeywordDictionaryLoader = new JsonKeywordDictionaryLoader( this._dictMap );
    let lexer: Lexer = new Lexer( LANGUAGE, dictLoader );

    let parser = new Parser();

    let nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( LANGUAGE );

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