import { NLPTrainingDataConversor } from '../../modules/nlp/NLPTrainingDataConversor';
import { NLPIntentExample, NLPTrainingData } from '../../modules/nlp/NLPTrainingData';
import { NLP } from '../../modules/nlp/NLP';
import { NLPResult } from '../../modules/nlp/NLPResult';
import { Entities } from '../../modules/nlp/Entities';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPTest', () => {

    let nlp: NLP; // under test

    function fakeTrainingData(): NLPTrainingData {
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( {}, [] );        
        return data;
    } 

    function recog( text: string, expected: any, expectedEntity: Entities ): NLPResult | null {
        let r: NLPResult = nlp.recognize( 'en', text );
        if ( null === expected ) {
            expect(
                // not recognized
                null === r
                // or not a constant
                || ! r.entities.find( e => e.entity === expectedEntity )
            ).toBeTruthy();
        } else {
            expect( r.entities ).toHaveLength( 1 );
            expect( r.entities[ 0 ].entity ).toBe( expectedEntity );
            expect( r.entities[ 0 ].value ).toBe( expected );
        }
        return r;
    }

    beforeEach( () => {
        nlp = new NLP();
    } );


    it( 'starts untrained in any language', () => {
        expect( nlp.isTrained( 'en' ) ).toBeFalsy();
        expect( nlp.isTrained( 'pt' ) ).toBeFalsy();
    } );


    it( 'can be trained in a language', () => {
        nlp.train( 'en', fakeTrainingData() );
        expect( nlp.isTrained( 'en' ) ).toBeTruthy();

        nlp.train( 'pt', fakeTrainingData() );
        expect( nlp.isTrained( 'pt' ) ).toBeTruthy();
    } );


    it( 'cannot recognize any entity if not trained', () => {
        expect( nlp.isTrained( 'en' ) ).toBeFalsy();
        let r: NLPResult = nlp.recognize( 'en', ' "hello" ' );
        expect( r.entities ).toHaveLength( 0 );
    } );


    describe( 'simple entities', () => {

        beforeEach( () => {
            nlp.train( 'en', fakeTrainingData() );
        } );        


        describe( 'value', () => {

            function recogValue( text: string, expected: string | null ): NLPResult | null {
                return recog( text, expected, Entities.VALUE );
            }             

            it( 'between quotes', () => {
                recogValue( ' "foo" ', 'foo' );
            } );

            it( 'with escaped quotes', () => {
                recogValue( ' "foo and \\\"bar\\\"" ', 'foo and \\\"bar\\\"' );
            } );

            // documenting a current limitation
            it( 'still does not recognize a string that ends with escaped backslash', () => {
                recogValue( ' "this is not recognized \\"', null );
            } );

            it( 'more than one value', () => {
                let r: NLPResult = nlp.recognize( 'en', ' prop is "foo" or "bar" ' );
                expect( r.entities ).toHaveLength( 2 );

                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE );
                expect( r.entities[ 0 ].value ).toBe( 'foo' );

                expect( r.entities[ 1 ].entity ).toBe( Entities.VALUE );
                expect( r.entities[ 1 ].value ).toBe( 'bar' );
            } );

        });


        describe( 'number', () => {

            function recogNumber( text: string, expected: string | null ): NLPResult | null {
                return recog( text, expected, Entities.NUMBER );
            }            

            it( 'positive integer number', () => {
                recogNumber( ' 3 ', '3' );
            } );

            it( 'positive double number', () => {
                recogNumber( ' 3.14159 ', '3.14159' );
            } );

            it( 'negative integer number', () => {
                recogNumber( ' -3 ', '-3' );                
            } );

            it( 'negative double number', () => {
                recogNumber( ' -3.14159 ', '-3.14159' );
            } );

        } );


        describe( 'element', () => {

            function recogElement( text: string, expected: string | null ): NLPResult | null {
                return recog( text, expected, Entities.ELEMENT );
            }

            describe( 'recognizes', () => {

                it( 'single word', () => {
                    recogElement( ' {foo} ', 'foo' );
                } );

                it( 'words', () => {
                    recogElement( ' {foo bar} ', 'foo bar' );
                } );                

            } );

        } );


        describe( 'query', () => {

            function recogQuery( text: string, expected: string | null ): NLPResult | null {
                return recog( text, expected, Entities.QUERY );
            }             
        
            it( 'in uppercase', () => {
                recogQuery( ' "SELECT foo FROM bar" ', 'SELECT foo FROM bar' );
            } );

            it( 'in lowercase', () => {
                recogQuery( ' "select foo FROM bar" ', 'select foo FROM bar' );
            } );

            it( 'with spaces before select', () => {
                recogQuery( ' "  SELECT foo FROM bar" ', 'SELECT foo FROM bar' );
            } );            

        } );

        
        describe( 'constant', () => {

            function recogConstant( text: string, expected: string | null ): NLPResult | null {
                return recog( text, expected, Entities.CONSTANT );
            }          

            describe( 'recognizes', () => {

                it( 'a single word', () => {
                    recogConstant( ' [foo] ', 'foo' );
                } );                

                it( 'words', () => {
                    recogConstant( ' [foo bar] ', 'foo bar' );
                } );

                it( 'words with spaces around', () => {
                    recogConstant( ' [  foo bar  ] ', 'foo bar' );
                } );

                it( 'words with numbers', () => {
                    recogConstant( ' [foo 1 bar 2] ', 'foo 1 bar 2' );
                } );                

            } );

            describe( 'should not recognize', () => {

                it( 'starting with a number', () => {
                    recogConstant( ' [1foo] ', null );
                } );

                it( 'a number', () => {
                    recogConstant( ' [1] ', null );
                } );                

            } );  

        } );


        describe( 'value list', () => {

            function recogValueList( text: string, expected: string | null ): NLPResult | null {
                return recog( text, expected, Entities.VALUE_LIST );
            }             
        
            it( 'does not recognize an empty list', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [] ' );
                expect( r.entities ).toHaveLength( 0 );
            } );

            it( 'single number', () => {
                recogValueList( ' [1] ', '[1]' );
            } );        

            it( 'numbers', () => {
                recogValueList( ' [1, 2] ', '[1, 2]' );
            } );

            it( 'strings', () => {
                recogValueList( ' [ "alice", "bob" ] ', '[ "alice", "bob" ]' );
            } );

            it( 'strings with escaped strings', () => {
                recogValueList(
                    ' [ "alice say \\\"hello\\\"" ] ',
                    '[ "alice say \\\"hello\\\"" ]'
                );
            } );

            it( 'strings and numbers mixed', () => {
                
                recogValueList(
                    ' [ "alice", 1, "bob", 2 ] ',
                    '[ "alice", 1, "bob", 2 ]'
                );

                recogValueList(
                    ' [ 1, "alice", 2, "bob", 3, 4, "bob", "joe" ] ',
                    '[ 1, "alice", 2, "bob", 3, 4, "bob", "joe" ]'
                );

            } );        

        } );

    } );

} );