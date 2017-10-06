import { NLPTrainingDataConversor } from '../../modules/nlp/NLPTrainingDataConversor';
import { NLPEntityUsageExample, NLPTrainingData } from '../../modules/nlp/NLPTrainingData';
import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPTest', () => {

    let nlp: NLP; // under test

    beforeEach( () => {
        nlp = new NLP();
    } );

    it( 'starts untrained in any language', () => {
        expect( nlp.isTrained( 'en' ) ).toBeFalsy();
        expect( nlp.isTrained( 'pt' ) ).toBeFalsy();
    } );

    it( 'can be trained in a language', () => {
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( {}, [] );

        nlp.train( 'en', data );
        expect( nlp.isTrained( 'en' ) ).toBeTruthy();

        nlp.train( 'pt', data );
        expect( nlp.isTrained( 'pt' ) ).toBeTruthy();
    } );

} );