import { NLPUtil, NLP, NLPTrainingDataConversor, NLPResult, Entities } from '../../modules/nlp';

describe( 'NLPUtil', () => {

    const nlpUtil = new NLPUtil(); // immutable, under test

    let nlp: NLP; // helper
    const LANGUAGE: string = 'en';

    beforeAll( () => {
        nlp = new NLP();
        const fakeData = ( new NLPTrainingDataConversor() ).convert( {}, [] );
        nlp.train( LANGUAGE, fakeData );
    } );

    afterAll( () => {
        nlp = null;
    } );

    it( 'filters named entities', () => {
        const nlpResult: NLPResult = nlp.recognize( LANGUAGE, 'I see 27' );
        const entities = nlpUtil.entitiesNamed( Entities.NUMBER, nlpResult );
        expect( entities ).toHaveLength( 1 );
    } );

    it( 'detects named entities', () => {
        const nlpResult: NLPResult = nlp.recognize( LANGUAGE, 'I see 27' );
        const has = nlpUtil.hasEntityNamed( Entities.NUMBER, nlpResult );
        expect( has ).toBeTruthy();
    } );

    it( 'detects if it has all the given entities', () => {
        const nlpResult: NLPResult = nlp.recognize( LANGUAGE, 'I see 27 and "foo"' );
        const has = nlpUtil.hasEntitiesNamed( [ Entities.NUMBER, Entities.VALUE ], nlpResult );
        expect( has ).toBeTruthy();
    } );

    it( 'finds the given entity', () => {
        const nlpResult: NLPResult = nlp.recognize( LANGUAGE, 'I see 27 and "foo"' );
        const entity = nlpUtil.entityNamed( Entities.VALUE, nlpResult );
        expect( entity ).toBeDefined();
        expect( entity.entity ).toEqual( Entities.VALUE );
    } );

    it( 'extracts the values of the given entity', () => {
        const nlpResult: NLPResult = nlp.recognize( LANGUAGE, 'I see 27 and "foo"' );
        const values = nlpUtil.valuesOfEntitiesNamed( Entities.NUMBER, nlpResult );
        expect( values ).toEqual( [ 27 ] );
    } );


} );