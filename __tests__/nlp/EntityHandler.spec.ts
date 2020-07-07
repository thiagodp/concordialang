import { Entities } from '../../modules/nlp/Entities';
import { EntityHandler } from '../../modules/nlp/EntityHandler';
import { NLPEntity } from '../../modules/nlp/NLPEntity';
import { NLPResult } from '../../modules/nlp/NLPResult';

describe( 'EntityHandler', () => {

	it( 'no entities returns an empty array', () => {
		const h = new EntityHandler();
		const nr = { entities: undefined, } as NLPResult;
		const r = h.with( nr, Entities.CONSTANT );
		expect( r ).toHaveLength( 0 );
	} );

	it( 'filters the given entities', () => {

		const entities = [
			{ entity: Entities.VALUE } as NLPEntity,
			{ entity: Entities.CONSTANT } as NLPEntity,
			{ entity: Entities.DATE } as NLPEntity,
			{ entity: Entities.CONSTANT } as NLPEntity,
		];
		const nr = { entities: entities, } as NLPResult;

		const h = new EntityHandler();
		const r = h.with( nr, Entities.CONSTANT );
		const [ e1, e2, e3, e4 ] = entities;

		expect( r ).toEqual( [ e2, e4 ] );
	} );


	it( 'counts the given entities', () => {

		const entities = [
			{ entity: Entities.VALUE } as NLPEntity,
			{ entity: Entities.CONSTANT } as NLPEntity,
			{ entity: Entities.DATE } as NLPEntity,
			{ entity: Entities.CONSTANT } as NLPEntity,
		];
		const nr = { entities: entities, } as NLPResult;

		const h = new EntityHandler();
		const r = h.count( nr, Entities.CONSTANT );

		expect( r ).toEqual( 2 );
	} );

	it( 'indicates if it has the given entities', () => {

		const entities = [
			{ entity: Entities.VALUE } as NLPEntity,
			{ entity: Entities.CONSTANT } as NLPEntity
		];
		const nr = { entities: entities, } as NLPResult;

		const h = new EntityHandler();
		const r = h.has( nr, Entities.CONSTANT );
		expect( r ).toEqual( true );
	} );


	it( 'returns the values of the given entities', () => {

		const entities = [
			{ entity: Entities.VALUE, value: 10 } as NLPEntity,
			{ entity: Entities.CONSTANT, value: 'foo' } as NLPEntity
		];
		const nr = { entities: entities, } as NLPResult;

		const h = new EntityHandler();
		const r = h.values( nr, Entities.CONSTANT );
		expect( r ).toEqual( [ 'foo' ] );
	} );

} );
