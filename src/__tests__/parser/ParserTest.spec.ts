import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { Lexer } from '../../modules/lexer/Lexer';
import { Parser } from '../../modules/parser/Parser';
import { KeywordDictionary } from "../../modules/dict/KeywordDictionary";
import { Document } from '../../modules/ast/Document';
import { KeywordDictionaryLoader } from "../../modules/dict/KeywordDictionaryLoader";
import { InMemoryKeywordDictionaryLoader } from "../../modules/dict/InMemoryKeywordDictionaryLoader";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ParserTest', () => {

    let parser = new Parser(); // under test    

    let loader: KeywordDictionaryLoader = new InMemoryKeywordDictionaryLoader(
        { 'en': new EnglishKeywordDictionary() }
    );
    let lexer: Lexer = new Lexer( 'en', loader );


    beforeEach( () => {
        lexer.reset();
    } );


    it( 'detects the language', () => {

        [
            '#language:en'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        let doc: Document = {};
        parser.analyze( lexer.nodes(), doc );

        expect( parser.errors() ).toEqual( [] );
        expect( doc.language ).toBeDefined();
        expect( doc.language.content ).toBe( "en" );
    } );


    it( 'detect a feature with tags', () => {
        
        [
            '#language:en',
            '',
            '@important @hello( world )',
            'feature: my feature'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        let doc: Document = {};
        parser.analyze( lexer.nodes(), doc );

        expect( parser.errors() ).toEqual( [] );

        expect( doc.feature ).toBeDefined();
        expect( doc.feature.name ).toBe( "my feature" );

        expect( doc.feature.tags ).toBeDefined();
        expect( doc.feature.tags ).toHaveLength( 2 );

        let tagNames = doc.feature.tags.map( v => v.name );
        expect( tagNames ).toEqual( [ "important", "hello" ] );

        expect( doc.feature.tags[ 1 ].content ).toEqual( [ "world" ] );
    } );    
    

    it( 'analyzes correctly 1', () => {

        [
            '#language:en',
            '',
            '@important',
            'feature: my feature',
            ' \t',
            'scenario: hello',
            '  given something',
            '    and another thing',
            '  when anything happens',
            '    and other thing happens',
            '    but other thing does not happen',
            '  then the result is anything',
            '    and another result could also happen',
            '',
            'this must be recognized as text'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        let doc: Document = {};
        parser.analyze( lexer.nodes(), doc );

        expect( parser.errors() ).toEqual( [] );

        expect( doc.language ).toBeDefined();
        expect( doc.language.content ).toBe( "en" );

        expect( doc.feature ).toBeDefined();
        expect( doc.feature.name ).toBe( "my feature" );

        expect( doc.feature.scenarios ).toBeDefined();
        expect( doc.feature.scenarios ).toHaveLength( 1 );
        expect( doc.feature.scenarios[ 0 ].name ).toBe( "hello" );

    } );


    it( 'detects test cases with tags and sentences', () => {
        
        [
            '#language:en',
            '',
            'Feature: my feature',
            '',
            'Scenario: hello',
            '',
            '@feature( my feature )',
            '@scenario( hello )',
            'Test Case: hello',
            '  I see in the url "/login"',
            '  I fill "#username" with ""',
            '  I fill "#password" with "bobp4ss"',
            '  I click "Enter"',
            '  I see "Username must have at least 2 characters."'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        let doc: Document = {};
        parser.analyze( lexer.nodes(), doc );

        expect( parser.errors() ).toEqual( [] );

        expect( doc.feature.testcases ).toBeDefined();
        expect( doc.feature.testcases ).toHaveLength( 1 );

        let testcase = doc.feature.testcases[ 0 ];
        expect( testcase.name ).toBe( "hello" );

        let tagNames = testcase.tags.map( v => v.name );
        expect( tagNames ).toEqual( [ "feature", "scenario" ] );

        expect( testcase.sentences ).toBeDefined();
        expect( testcase.sentences ).toHaveLength( 5 );
    } );    

} );