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

    it( 'starts untrained', () => {
        expect( nlp.isTrained() ).toBeFalsy();
    } );

    it( 'can be trained', () => {
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( {}, [] );        
        nlp.train( data );
        expect( nlp.isTrained() ).toBeTruthy();
    } );

} );