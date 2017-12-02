import { FeatureSpecAnalyzer } from '../../modules/semantic/FeatureSpecAnalyzer';
import { Parser } from '../../modules/parser/Parser';
import { ScenarioSDA } from '../../modules/semantic/single/ScenarioSDA';
import { Lexer } from '../../modules/lexer/Lexer';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { Document } from '../../modules/ast/Document';
import { Spec } from '../../modules/ast/Spec';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'FeatureSpecAnalyzer', () => {

    const analyzer = new FeatureSpecAnalyzer(); // under test

    let parser = new Parser();
    
    let loader: KeywordDictionaryLoader = new InMemoryKeywordDictionaryLoader(
        { 'en': new EnglishKeywordDictionary() }
    );

    let lexer: Lexer = new Lexer( 'en', loader );

    let doc1: Document;    


    beforeEach( () => {
        lexer.reset();
    } );    

    it( 'does not critize when it is all right', () => {
        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        lexer.reset();

        [
            'feature: my feature 2',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc2: Document = {};
        parser.analyze( lexer.nodes(), doc2 );
        

        let spec = new Spec( '.' );        
        spec.docs.push( doc1, doc2 );

        let errors = [];
        analyzer.analyze( spec, errors );
        expect( errors ).toHaveLength( 0 );
    } );


    it( 'critizes duplicated names', () => {
        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        lexer.reset();

        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc2: Document = {};
        parser.analyze( lexer.nodes(), doc2 );
        

        let spec = new Spec( '.' );        
        spec.docs.push( doc1, doc2 );

        let errors = [];
        analyzer.analyze( spec, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );    

} );