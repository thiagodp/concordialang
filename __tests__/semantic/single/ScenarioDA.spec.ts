import { Document } from '../../../modules/ast/Document';
import languageMap from '../../../modules/language/data/map';
import { Lexer } from '../../../modules/lexer/Lexer';
import { Parser } from '../../../modules/parser/Parser';
import { ScenarioDA } from '../../../modules/semantic/single/ScenarioDA';

describe( 'ScenarioDA', () => {

    const analyzer = new ScenarioDA(); // under test

    let parser = new Parser();

    const lexer: Lexer = new Lexer( 'en', languageMap );

    beforeEach( () => {
        lexer.reset();
    } );

    it( 'does not criticize when it is all right', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 2'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        let errors = [];
        analyzer.analyze( doc1, errors );
        expect( errors ).toHaveLength( 0 );
    } );


    it( 'criticizes duplicated names', () => {
        [
            'feature: my feature',
            'scenario: my scenario 1',
            'scenario: my scenario 1'
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        const errors = [];
        analyzer.analyze( doc1, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );
