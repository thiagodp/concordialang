import { FeatureSSA } from '../../modules/semantic/FeatureSSA';
import { Parser } from '../../modules/parser/Parser';
import { ScenarioDA } from '../../modules/semantic/single/ScenarioDA';
import { Lexer } from '../../modules/lexer/Lexer';
import { Document } from '../../modules/ast/Document';
import { Spec } from '../../modules/ast/Spec';
import { Options } from '../../modules/app/Options';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';
import { resolve } from 'path';
import { SpecFilter } from '../../modules/selection/SpecFilter';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'FeatureSpecAnalyzerTest', () => {

    const analyzer = new FeatureSSA(); // under test

    let parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    let lexer: Lexer = ( new LexerBuilder() ).build( options, 'en' );

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
        const graph = ( new SpecFilter( spec ) ).graph();

        let errors = [];
        analyzer.analyze( graph, spec, errors );
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
        const graph = ( new SpecFilter( spec ) ).graph();

        let errors = [];
        analyzer.analyze( graph, spec, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );