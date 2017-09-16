import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPTest', () => {

    let nlp: NLP; // under test

    beforeEach( () => nlp = new NLP() );

    it( 'starts untrained', () => {
        expect( nlp.isTrained() ).toBeFalsy();
    } );

} );