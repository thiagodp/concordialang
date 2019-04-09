import { resolve } from 'path';
import { Feature } from 'concordialang-types/ast';
import { NodeIterator } from '../../modules/parser/NodeIterator';
import { ParsingContext } from '../../modules/parser/ParsingContext';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { FeatureParser } from '../../modules/parser/FeatureParser';
import { Lexer } from "../../modules/lexer/Lexer";
import { Options } from '../../modules/app/Options';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'FeatureParserTest', () => {

    let parser = new FeatureParser(); // under test

    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    let lexer: Lexer = ( new LexerBuilder() ).build( options, 'en' );

    let context: ParsingContext = null;
    let errors: Error[] = [];

    let featureNode: Feature = {
        nodeType: NodeTypes.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };

    beforeEach( () => {
        errors = [];
        context = new ParsingContext();
        lexer.reset();
    } );


    it( 'adds a feature when a feature is not defined', () => {
        expect( context.doc.feature ).not.toBeDefined();

        let nodes = [ featureNode ];
        let nodeIt = new NodeIterator( nodes );
        parser.analyze( featureNode, context, nodeIt, errors );

        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature ).toBeDefined();
        expect( context.doc.feature.name ).toBe( "My feature" );
    } );

    it( 'generates an error when a feature was already defined', () => {
        let nodes = [ featureNode, featureNode ];
        let nodeIt = new NodeIterator( nodes );
        parser.analyze( featureNode, context, nodeIt, errors );
        parser.analyze( featureNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 1 );
    } );

    it( 'indicates that it is in a feature when a feature is detected', () => {
        let nodes = [ featureNode ];
        let nodeIt = new NodeIterator( nodes );
        parser.analyze( featureNode, context, nodeIt, errors );
        expect( context.inFeature ).toBeTruthy();
    } );

    it( 'is able to collect backward tags', () => {
        let line = 0;
        lexer.addNodeFromLine( '@foo @bar( zoo )', ++line );
        lexer.addNodeFromLine( 'Feature: My Feature', ++line );

        let nodes = lexer.nodes();
        let nodeIt = new NodeIterator( nodes );
        expect( lexer.nodes() ).toHaveLength( 3 );
        expect( nodeIt.nodes() ).toHaveLength( 3 );

        // It is needed to move the iterator to the feature
        nodeIt.next(); // tag 1
        nodeIt.next(); // tag 2
        nodeIt.next(); // feature
        parser.analyze( nodes[ 0 ] as Feature, context, nodeIt, errors );

        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature.tags ).toHaveLength( 2 );
    } );

    it( 'is able to collect forward sentences', () => {
        let line = 0;
        lexer.addNodeFromLine( 'Feature: My Feature', ++line );
        lexer.addNodeFromLine( '  As a user', ++line );
        lexer.addNodeFromLine( '  I would like to dance', ++line );
        lexer.addNodeFromLine( '  In order to have fun', ++line );

        let nodes = lexer.nodes();
        let nodeIt = new NodeIterator( nodes );
        expect( nodes ).toHaveLength( 4 );
        expect( nodeIt.nodes() ).toHaveLength( 4 );

        // It is needed to move the iterator to the feature
        nodeIt.next(); // feature
        parser.analyze( nodes[ 0 ] as Feature, context, nodeIt, errors );

        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature.sentences ).toHaveLength( 3 );
    } );

} );