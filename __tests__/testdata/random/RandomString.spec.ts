import { Random } from "../../../modules/testdata/random/Random";
import { RandomString } from "../../../modules/testdata/random/RandomString";

describe( 'RandomString', () => {

    const _r = new Random();
	let random = new RandomString( _r );

	it( 'can set the minimum string character', () => {
		const r = new RandomString( _r );
		expect( r.minCharCode( 65 ) ).toEqual( 65 );
	} );

	it( 'can set the maximum string character', () => {
		const r = new RandomString( _r );
		expect( r.maxCharCode( 65 ) ).toEqual( 65 );
	} );

	it( 'cannot set the minimum string character greater than the maximum', () => {
		const r = new RandomString( _r );
		expect( r.maxCharCode( 65 ) ).toEqual( 65 );
		expect( r.minCharCode( 66 ) ).toEqual( 65 );
	} );

	it( 'cannot set the maximum string character less than the minimum', () => {
		const r = new RandomString( _r );
		expect( r.minCharCode( 65 ) ).toEqual( 65 );
		expect( r.maxCharCode( 64 ) ).toEqual( 65 );
	} );

    it( 'can generate an empty string', () => {
        expect( random.exactly( 0 ) ).toBe( '' );
        expect( random.between( 0, 0 ) ).toBe( '' );
    } );

    it( 'can generate certain string sizes, exactly', () => {
        expect( random.exactly( 1 ) ).toHaveLength( 1 );
        expect( random.exactly( 100 ) ).toHaveLength( 100 );
        expect( random.exactly( 1000 ) ).toHaveLength( 1000 );
    } );

    it( 'can generate strings with length between values', () => {
        expect( random.between( 1, 1 ) ).toHaveLength( 1 );
        expect( random.between( 10, 60 ).length ).toBeLessThanOrEqual( 60 );
        expect( random.between( 10, 60 ).length ).toBeGreaterThanOrEqual( 10 );
    } );

    it( 'can avoid database characters', () => {
        let random = new RandomString( _r, { avoidDatabaseChars: true } );
        const result = random.exactly( 10000 );
        expect( result.indexOf( "'" ) ).toBeLessThan( 0 );
        expect( result.indexOf( "\"" ) ).toBeLessThan( 0 );
        expect( result.indexOf( "%" ) ).toBeLessThan( 0 );
        expect( result.indexOf( "`" ) ).toBeLessThan( 0 );
    } );

} );
