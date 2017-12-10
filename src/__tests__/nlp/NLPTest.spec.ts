import { NLPTrainingDataConversor } from '../../modules/nlp/NLPTrainingDataConversor';
import { NLPEntityUsageExample, NLPTrainingData } from '../../modules/nlp/NLPTrainingData';
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


    it( 'recognizes a value entity after being trained', () => {
        nlp.train( 'en', fakeTrainingData() );
        let r: NLPResult = nlp.recognize( 'en', ' "foo" ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.VALUE );
        expect( r.entities[ 0 ].value ).toBe( 'foo' );
    } );


    it( 'recognizes a number entity after being trained', () => {
        nlp.train( 'en', fakeTrainingData() );
        let r: NLPResult;

        r = nlp.recognize( 'en', ' 3 ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );      
        expect( r.entities[ 0 ].value ).toBe( '3' );

        r = nlp.recognize( 'en', ' 3.14159 ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );
        expect( r.entities[ 0 ].value ).toBe( '3.14159' );

        r = nlp.recognize( 'en', ' -3 ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );
        expect( r.entities[ 0 ].value ).toBe( '-3' );
        
        r = nlp.recognize( 'en', ' -3.14159 ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.NUMBER );
        expect( r.entities[ 0 ].value ).toBe( '-3.14159' );
    } );
    

    it( 'recognizes a element entity after being trained', () => {
        nlp.train( 'en', fakeTrainingData() );

        let r: NLPResult = nlp.recognize( 'en', ' {foo} ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.ELEMENT );
        expect( r.entities[ 0 ].value ).toBe( 'foo' );

        r = nlp.recognize( 'en', ' {foo bar} ' );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.ELEMENT );
        expect( r.entities[ 0 ].value ).toBe( 'foo bar' );
    } );

    
    it( 'recognizes a query entity after being trained', () => {
        nlp.train( 'en', fakeTrainingData() );

        let r: NLPResult = nlp.recognize( 'en', " 'SELECT foo FROM bar' " );
        expect( r.entities ).toHaveLength( 1 );
        expect( r.entities[ 0 ].entity ).toBe( Entities.QUERY );
        expect( r.entities[ 0 ].value ).toBe( 'SELECT foo FROM bar' );
    } );    

} );