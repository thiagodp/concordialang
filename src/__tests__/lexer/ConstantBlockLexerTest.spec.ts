import { ConstantBlock } from '../../modules/ast/ConstantBlock';
import { ConstantBlockLexer } from '../../modules/lexer/ConstantBlockLexer';
import { NodeTypes } from '../../modules/req/NodeTypes';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ConstantBlockLexerTest', () => {

    let words = [ 'constants' ];
    let lexer = new ConstantBlockLexer( words ); // under test

    // IMPORTANT: Since the lexer under test inherits from another lexer and 
    // there are tests for the parent class, few additional tests are necessary.

    it( 'detects in the correct position', () => {
        let line = '\tConstants\t:\t';
        let node = lexer.analyze( line, 1 ).nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.CONSTANT_BLOCK,
                location: { line: 1, column: 2 },
                content: 'Constants'
            } as ConstantBlock
        );
    } );

    it( 'ignores a comment', () => {
        let line = 'Constants:# some comment here';
        let node = lexer.analyze( line, 1 ).nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.CONSTANT_BLOCK,
                location: { line: 1, column: 1 },
                content: 'Constants'
            } as ConstantBlock
        );        
    } );

} );