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
describe( 'ScenarioSDATest', () => {

    const analyzer = new ScenarioSDA(); // under test

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
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 2'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        let spec = new Spec( '.' );        
        spec.docs.push( doc1 );

        let errors = [];
        analyzer.analyze( spec, doc1, errors );
        expect( errors ).toHaveLength( 0 );
    } );


    it( 'critizes duplicated names', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 1'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        let spec = new Spec( '.' );        
        spec.docs.push( doc1 );

        let errors: Error[] = [];
        analyzer.analyze( spec, doc1, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );    

} );