import { Intents, NLPResult } from '../../modules/nlp';

export function shouldHaveEntities(
    results: NLPResult[],
    expectedEntitiesNames: string[],
    intent: string,
    debug: boolean = false
) {
    for ( const r of results ) {
        if ( debug ) { console.log( 'NLP Result is', r ); }
        expect( r ).not.toBeFalsy();
        expect( r.intent ).toEqual( intent );
        expect( r.entities ).not.toBeNull();
        expect( r.entities.length ).toBeGreaterThanOrEqual( expectedEntitiesNames.length );
        const entities = r.entities.map( e => e.entity );
        expect( entities ).toEqual( expect.arrayContaining( expectedEntitiesNames ) ); // it doesn't matter the array order
    }
}

export function shouldNotHaveEntities(
    r: NLPResult,
    notExpectedEntitiesNames: string[],
    intent: string,
    debug: boolean = false
) {
    if ( debug ) { console.log( 'NLP Result is', r ); }
    expect( r ).not.toBeFalsy();
    expect( r.intent ).toEqual( intent );
    expect( r.entities ).not.toBeNull();
    const entities = r.entities.map( e => e.entity );
    expect( entities ).not.toEqual( expect.arrayContaining( notExpectedEntitiesNames ) ); // it doesn't matter the array order
}

export function shouldHaveTestCaseEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
    shouldHaveEntities( results, expectedEntitiesNames, Intents.TEST_CASE, debug );
}

export function shouldHaveUIEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
    shouldHaveEntities( results, expectedEntitiesNames, Intents.UI, debug );
}