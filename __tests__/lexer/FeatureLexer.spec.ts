import { FeatureLexer } from '../../modules/lexer/FeatureLexer';
import { NodeTypes } from '../../modules/req/NodeTypes';

describe( 'FeatureLexer', () => {

    let words = [ 'feature' ];
    let lexer = new FeatureLexer( words );

    it( 'detects a feature in a line', () => {
        let line = 'Feature: Hello world';
        expect( lexer.analyze( line ) ).not.toBeNull();
    } );

    it( 'detects a feature in a line with spaces and tabs', () => {
        let line = "  \t  \t Feature: Hello world";
        expect( lexer.analyze( line ) ).not.toBeNull()
    } );

    it( 'does not detect an inexistent feature in a line', () => {
        let line = 'Someelse: Hello world';
        expect( lexer.analyze( line ) ).toBeNull()
    } );

    it( 'does not detect a feature when its keyword is not the first one', () => {
        let line = 'Not a feature: Hello world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect a feature when its keyword is not followed by the title separator', () => {
        let line = 'Feature Hello world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect a feature not followed by a colon', () => {
        let line = "feature feature : Hello world";
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'detects a feature in the correct position', () => {
        let line = 'Feature: Hello world';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.FEATURE,
                name: "Hello world",
                location: { line: 1, column: 1 }
            }
        );
    } );

    it( 'detects a feature in the correct position even with additional spaces or tabs', () => {
        let line = "  \t \tfeature \t : \t Hello world     ";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.FEATURE,
                name: "Hello world",
                location: { line: 1, column: 6 }
            }
        );
    } );

    it( 'ignores a comment after the name', () => {
        let line = "  \t \tfeature \t : \t Hello world#a comment";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.FEATURE,
                location: { line: 1, column: 6 },
                name: "Hello world"
            }
        );
    } );

} );