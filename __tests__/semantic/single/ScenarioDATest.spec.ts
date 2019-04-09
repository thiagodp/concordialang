import { resolve } from 'path';
import { Document } from 'concordialang-types/ast';
import { Parser } from '../../../modules/parser/Parser';
import { ScenarioDA } from '../../../modules/semantic/single/ScenarioDA';
import { Lexer } from '../../../modules/lexer/Lexer';
import { LexerBuilder } from '../../../modules/lexer/LexerBuilder';
import { Options } from '../../../modules/app/Options';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ScenarioDATest', () => {

    const analyzer = new ScenarioDA(); // under test

    let parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    let lexer: Lexer = ( new LexerBuilder() ).build( options );


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

        let errors = [];
        analyzer.analyze( doc1, errors );
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

        let errors: Error[] = [];
        analyzer.analyze( doc1, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );