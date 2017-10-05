import { UIProperty } from '../../modules/ast/UIElement';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { ContentNode } from '../../modules/ast/Node';
import { NLPBuilder } from '../../modules/nlp/NLPBuilder';
import { NLP } from '../../modules/nlp/NLP';
import { UIPropertyRecognizer } from "../../modules/nlp/UIPropertyRecognizer";
import { Lexer } from '../../modules/lexer/Lexer';

describe( 'UIPropertyRecognizerTest', () => {

    let nodes = [];
    let errors = [];
    let warnings = [];

    // helper
    function makeNode( content: string, line = 1, column = 1 ): UIProperty {
        return {
            nodeType: NodeTypes.UI_PROPERTY ,
            location: { line: line, column: column },
            content: content
        } as UIProperty;
    }

    beforeAll( () => {
        nodes = [];
        errors = [];
        warnings = [];
    } );


   describe( 'In Portuguese', () => {

        let nlpPt = ( new NLPBuilder() ).buildTrainedNLP( 'pt' ); // pt == portuguese    
        let rec = new UIPropertyRecognizer( nlpPt ); // under test

        function shouldRecognize( sentence: string, property: string, value: string ): void {
            let node = makeNode( sentence );
            nodes.push( node );
            rec.recognizeSentences( nodes, errors, warnings );
            expect( errors ).toHaveLength( 0 );
            expect( warnings ).toHaveLength( 0 );

            expect( node.property ).toBe( property );
            expect( node.values ).toContain( value );
        }

        it( 'recognizes an id with a value', () => {
            shouldRecognize( '- id é "foo"', 'id', 'foo' );
        } );

        it( 'recognizes a max length with a value', () => {
            shouldRecognize( '- comprimento máximo é 7', 'maxlength', '7' );
        } );

        it( 'recognizes a min length with a value', () => {
            shouldRecognize( '- comprimento mínimo é 1', 'minlength', '1' );
        } );

        it( 'recognizes a max value with a value', () => {
            shouldRecognize( '- valor máximo é 7.33', 'maxvalue', '7.33' );
        } );

        it( 'recognizes a min value with a value', () => {
            shouldRecognize( '- valor mínimo é -15.22', 'minvalue', '-15.22' );
        } );

        it( 'recognizes a value with a query', () => {
            shouldRecognize( "- valor vem da consulta 'SELECT * FROM someTable'", 'value', 'SELECT * FROM someTable' );
        } );

    } );

} );