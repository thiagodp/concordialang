import { JsonKeywordDictionaryLoader } from '../../modules/dict/JsonKeywordDictionaryLoader';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { SingleDocumentProcessor } from '../../modules/app/SingleDocumentProcessor';
import {Spec} from '../../modules/ast/Spec';
import {Lexer} from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import {EnglishKeywordDictionary} from '../../modules/dict/EnglishKeywordDictionary';
import {InMemoryKeywordDictionaryLoader} from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import {KeywordDictionaryLoader} from '../../modules/dict/KeywordDictionaryLoader';
import {Parser} from '../../modules/parser/Parser';
import { QuerySDA } from '../../modules/semantic/QuerySDA';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Options } from '../../modules/app/Options';
import { resolve } from 'path';

describe( 'QuerySDATest', () => {

    let analyzer: QuerySDA = new QuerySDA(); // under test

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );

    const LANGUAGE = 'pt';

    let dictMap = { 'en': new EnglishKeywordDictionary() };
    
    let dictLoader: KeywordDictionaryLoader = new JsonKeywordDictionaryLoader( options.languageDir, this._dictMap );
    let lexer: Lexer = new Lexer( LANGUAGE, dictLoader );

    let parser = new Parser();

    let nlpTrainer = new NLPTrainer( options.nlpDir, options.trainingDir );
    let nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

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



    it( 'recognizes a database name', async () => {

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


    it( 'recognizes a constant', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'Constants:',
                ' - "pi" é "3.14"'
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE populacao = [pi]"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toEqual( [] );
    } );


    it( 'recognizes a table', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'Table: my table',
                '|a|b|',
                '|1|2|'
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM [my table] WHERE populacao > 100"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toEqual( [] );
    } );


    it( 'recognizes a ui element', async () => {
        
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
                'UI Element: Search',
                ' - id é "sch"',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE nome = {Search}"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toEqual( [] );
    } );


    it( 'recognizes a ui element with feature name', async () => {
        
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
                'UI Element: Search',
                ' - id é "sch"',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE nome = {feature 2:Search}"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toEqual( [] );
    } );


    it( 'recognizes a ui element of another feature', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'UI Element: Some Element',
                ' - id é "se"',
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: Search',
                ' - id é "sch"',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE nome = {feature 1:Some Element}"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).toEqual( [] );
    } );


    it( 'does not recognize a wrong database', async () => {
        
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
        expect( errors[ 0 ].message ).toMatch( /non-existent/ui );
    } );



    it( 'does not recognize a wrong constant', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'Constants:',
                ' - "pi" é "3.14"'
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE populacao = [foo]"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).not.toEqual( [] );
        expect( errors[ 0 ].message ).toMatch( /non-existent.*foo/ui );
    } );
    
    
    it( 'does not recognize a wrong table', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'Table: my table',
                '|a|b|',
                '|1|2|'
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM [wrong table] WHERE populacao > 100"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).not.toEqual( [] );
        expect( errors[ 0 ].message ).toMatch( /non-existent.*wrong table/ui );
    } );


    it( 'does not recognize a wrong ui element', async () => {
        
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
                'UI Element: Search',
                ' - id é "sch"',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE nome = {Foo}"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).not.toEqual( [] );
        expect( errors[ 0 ].message ).toMatch( /non-existent.*ui element/ui );
    } );    
    
    
    it( 'does not recognize a wrong ui element of another feature', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'UI Element: Some Element',
                ' - id é "se"',
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: Search',
                ' - id é "sch"',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE nome = {feature 1:Wrong Element}"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).not.toEqual( [] );
        expect( errors[ 0 ].message ).toMatch( /ui element.*feature/ui );
    } );


    it( 'does not recognize a ui element of a wrong feature', async () => {
        
        let spec = new Spec( '.' );

        let doc1: Document = addToSpec( spec, 
            [
                'feature: feature 1',
                'UI Element: Some Element',
                ' - id é "se"',
            ] );

        let doc2: Document = addToSpec( spec, 
            [
                '#language:pt',
                'feature: feature 2',
                'UI Element: Search',
                ' - id é "sch"',
                'UI Element: City',
                ' - id é "cit"',
                ' - valor está em "SELECT nome FROM `cidade` WHERE nome = {feature 3:Some Element}"'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let errors = await analyzer.check( spec );
        expect( errors ).not.toEqual( [] );
        expect( errors[ 0 ].message ).toMatch( /non-existent feature/ui );
    } );    
    
} );