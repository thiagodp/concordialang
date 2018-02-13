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

            it( 'between quotes', () => {
                let r: NLPResult = nlp.recognize( 'en', ' "foo" ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE );
                expect( r.entities[ 0 ].value ).toBe( 'foo' );
            } );

            it( 'with escaped quotes', () => {
                let r: NLPResult = nlp.recognize( 'en', ' "foo is \"bar\""' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE );
                expect( r.entities[ 0 ].value ).toBe( 'foo is \"bar\"' );
            } );

        });


        describe( 'number', () => {

            it( 'positive integer number', () => {
                let r: NLPResult = nlp.recognize( 'en', ' 3 ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );      
                expect( r.entities[ 0 ].value ).toBe( '3' );                
            } );

            it( 'positive double number', () => {
                let r: NLPResult = nlp.recognize( 'en', ' 3.14159 ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );
                expect( r.entities[ 0 ].value ).toBe( '3.14159' );
            } );

            it( 'negative integer number', () => {
                let r: NLPResult = nlp.recognize( 'en', ' -3 ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );      
                expect( r.entities[ 0 ].value ).toBe( '-3' );                
            } );

            it( 'negative double number', () => {
                let r: NLPResult = nlp.recognize( 'en', ' -3.14159 ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );
                expect( r.entities[ 0 ].value ).toBe( '-3.14159' );
            } );

        } );


        describe( 'element', () => {
        
            it( 'recognizes', () => {

                let r: NLPResult = nlp.recognize( 'en', ' {foo} ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.ELEMENT );
                expect( r.entities[ 0 ].value ).toBe( 'foo' );

                r = nlp.recognize( 'en', ' {foo bar} ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.ELEMENT );
                expect( r.entities[ 0 ].value ).toBe( 'foo bar' );
            } );

        } );


        describe( 'query', () => {
        
            it( 'in uppercase', () => {
                let r: NLPResult = nlp.recognize( 'en', ' "SELECT foo FROM bar" ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.QUERY );
                expect( r.entities[ 0 ].value ).toBe( 'SELECT foo FROM bar' );
            } );

            it( 'in lowercase', () => {
                let r: NLPResult = nlp.recognize( 'en', ' "select foo FROM bar" ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.QUERY );
                expect( r.entities[ 0 ].value ).toBe( 'select foo FROM bar' );
            } );

            it( 'with spaces before select', () => {
                let r: NLPResult = nlp.recognize( 'en', ' "  SELECT foo FROM bar" ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.QUERY );
                expect( r.entities[ 0 ].value ).toBe( 'SELECT foo FROM bar' );
            } );            

        } );

        
        describe( 'constant', () => {

            it( 'recognizes', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [foo bar] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.CONSTANT );
                expect( r.entities[ 0 ].value ).toBe( 'foo bar' );
            } );

        } );

        describe( 'value list', () => {
        
            it( 'does not recognize an empty list', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [] ' );
                expect( r.entities ).toHaveLength( 0 );
            } );

            it( 'single number', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [1] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE_LIST );
                expect( r.entities[ 0 ].value ).toBe( '[1]' );
            } );        

            it( 'numbers', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [1, 2] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE_LIST );
                expect( r.entities[ 0 ].value ).toBe( '[1, 2]' );
            } );

            it( 'strings', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [ "alice", "bob" ] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE_LIST );
                expect( r.entities[ 0 ].value ).toBe( '[ "alice", "bob" ]' );
            } );

            it( 'strings with escaped strings', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [ "alice say \\\"hello\\\"" ] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE_LIST );
                expect( r.entities[ 0 ].value ).toBe( '[ "alice say \\\"hello\\\"" ]' );
            } );        

            it( 'strings and numbers mixed', () => {
                let r: NLPResult = nlp.recognize( 'en', ' [ "alice", 1, "bob", 2 ] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE_LIST );
                expect( r.entities[ 0 ].value ).toBe( '[ "alice", 1, "bob", 2 ]' );

                r = nlp.recognize( 'en', ' [ 1, "alice", 2, "bob", 3, 4, "bob", "joe" ] ' );
                expect( r.entities ).toHaveLength( 1 );
                expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE_LIST );
                expect( r.entities[ 0 ].value ).toBe( '[ 1, "alice", 2, "bob", 3, 4, "bob", "joe" ]' );            
            } );        

        } );

    } );

} );