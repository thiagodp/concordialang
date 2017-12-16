import { JsonKeywordDictionaryLoader } from '../../modules/dict/JsonKeywordDictionaryLoader';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { SingleDocumentProcessor } from '../../modules/cli/SingleDocumentProcessor';
import {Spec} from '../../modules/ast/Spec';
import {Lexer} from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import {EnglishKeywordDictionary} from '../../modules/dict/EnglishKeywordDictionary';
import {InMemoryKeywordDictionaryLoader} from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import {KeywordDictionaryLoader} from '../../modules/dict/KeywordDictionaryLoader';
import {Parser} from '../../modules/parser/Parser';
import { QuerySDA } from '../../modules/semantic/QuerySDA';


describe( 'QuerySDATest', () => {

    let analyzer: QuerySDA = new QuerySDA(); // under test


    
    const LANGUAGE = 'pt';

    let dictMap = { 'en': new EnglishKeywordDictionary() };
    
    let dictLoader: KeywordDictionaryLoader = new JsonKeywordDictionaryLoader( this._dictMap );
    let lexer: Lexer = new Lexer( LANGUAGE, dictLoader );

    let parser = new Parser();

    let nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( LANGUAGE );

    let singleDocProcessor: SingleDocumentProcessor = new SingleDocumentProcessor();

    let analyze = ( doc: Document, lexer: Lexer ): boolean => {
        return singleDocProcessor.analyzeNodes( doc, lexer, parser, nlpRec, LANGUAGE );
    };    

    let addToSpec = ( spec: Spec, lines: string[] ): Document => {
        lines.forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {} as Document;
        analyze( doc, lexer );
        spec.docs.push( doc );
        return doc;
    };



    it( 'does not recognize an inexisting database name', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'Database: My DB',
                ' - type is "mysql"',
                ' - name is "acme"',
                ' - host is "127.0.0.1"',
                ' - username is "root"',
                ' - password is ""'
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM [Wrong DB].`cidade`"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /inexisting/ui );
    } );



    it( 'recognizes an existing database name', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'Database: My DB',
                ' - type is "mysql"',
                ' - name is "acme"',
                ' - host is "127.0.0.1"',
                ' - username is "root"',
                ' - password is ""'
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM [My DB].`cidade`"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toEqual( [] );
    } );    

} );