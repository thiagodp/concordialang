import { NodeTypes } from "../../modules/req/NodeTypes";
import { ConstantLexer } from "../../modules/lexer/ConstantLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ConstantLexerTest', () => {
    
    let words = [ 'is' ];
    let keyword = NodeTypes.CONSTANT;
    let lexer = new ConstantLexer( words ); // under test

    // IMPORTANT: Since the lexer under test inherits from another lexer and 
    // there are tests for the parent class, few additional tests are necessary.    

    it( 'detects correctly with a text value', () => {
        let line = '- "foo" is "bar"';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "bar"
            }
        );
    } );

    it( 'ignores a comment after a text value', () => {
        let line = '- "foo" is "bar"# some comment here';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "bar"
            }
        );
    } );

    it( 'detects correctly with a integer value', () => {
        let line = '- "foo" is 1';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "1"
            }
        );        
    } );

    it( 'ignores a comment after a integer value', () => {
        let line = '- "foo" is 1# some comment here';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "1"
            }
        );
    } );    

    it( 'detects correctly with a double value', () => {
        let line = '- "foo" is 1.0';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "1.0"
            }
        );  
    } );

    it( 'ignores a comment after a double value', () => {
        let line = '- "foo" is 1.0# some comment here';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: "1.0"
            }
        );
    } );    

    it( 'detects correctly with a big double value', () => {
        let value = '987654321098765432109876543210.33344445555566666677777778888888899999999';
        let line = `- "foo" is ${value}`;
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: value
            }
        );        
    } );

    it( 'ignores a comment after a big double value', () => {
        let value = '987654321098765432109876543210.33344445555566666677777778888888899999999';
        let line = `- "foo" is ${value}# some comment here`;
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                value: value
            }
        );
    } );    

    it( 'does not detect correctly a double value started with dot', () => {
        let line = '- "foo" is .33';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeNull();
    } );     

} );