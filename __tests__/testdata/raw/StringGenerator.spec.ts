import { Random } from "../../../modules/testdata/random/Random";
import { RandomString } from "../../../modules/testdata/random/RandomString";
import { StringGenerator } from "../../../modules/testdata/raw/StringGenerator";
import { StringLimits } from "../../../modules/testdata/limits/StringLimits";

describe( 'StringGenerator', () => {

    const ranS = new RandomString( new Random( 'concordia' ) );
    const aMin: number = 2;
    const aMax: number = 10;
    const aMedian: number = 6;
	const gen: StringGenerator = new StringGenerator( ranS, aMin, aMax ); // under test

	it( 'throws error when minlength is less than zero', () => {
		expect( () => {
			new StringGenerator( ranS, -1 );
		} ).toThrowError( /^Minimum/ );
	} );

	it( 'throws error when the usual maxlength is greater than the string limit', () => {
		expect( () => {
			new StringGenerator( ranS, 0, StringLimits.MAX + 1 );
		} ).toThrowError( /^Maximum string/ );
	} );

	it( 'throws error when maximum possible length is greater than the string limit', () => {
		expect( () => {
			new StringGenerator( ranS, 0, 10, StringLimits.MAX + 1 );
		} ).toThrowError( /^Maximum possible/ );
	} );

	it( 'returns the min length', () => {
		const g = new StringGenerator( ranS, 0 );
		expect( g.minLength() ).toBe( 0 );
	} );

	it( 'returns the max length', () => {
		const g = new StringGenerator( ranS, 0, 10 );
		expect( g.maxLength() ).toBe( 10 );
	} );

	it( 'computes the length diff', () => {
		const g = new StringGenerator( ranS, 1, 3 );
		expect( g.lengthDiff() ).toBe( 2 );
	} );

	it( 'computes the median length', () => {
		const g = new StringGenerator( ranS, 1, 3 );
		expect( g.medianLength() ).toBe( 2 );
	} );

	it( 'indicates when it has values between min and max', () => {
		const g = new StringGenerator( ranS, 1, 3 );
		expect( g.hasValuesBetweenMinAndMax() ).toBeTruthy();
	} );

	it( 'indicates when it doesn\'t have values between min and max', () => {
		const g = new StringGenerator( ranS, 1, 1 );
		expect( g.hasValuesBetweenMinAndMax() ).toBeFalsy();
	} );

	it( 'indicates when it has values below min', () => {
		const g = new StringGenerator( ranS, 1 );
		expect( g.hasValuesBelowMin() ).toBeTruthy();
	} );

	it( 'indicates when it does\'t have values below min', () => {
		const g = new StringGenerator( ranS, 0 );
		expect( g.hasValuesBelowMin() ).toBeFalsy();
	} );

	it( 'indicates when it has values above max', () => {
		const g = new StringGenerator( ranS, 0, StringLimits.MAX - 1 );
		expect( g.hasValuesAboveMax() ).toBeTruthy();
	} );

	it( 'indicates when it does\'t have values below min', () => {
		const g = new StringGenerator( ranS, 0, StringLimits.MAX );
		expect( g.hasValuesAboveMax() ).toBeFalsy();
	} );

	it( 'indicates when zero is between min and max', () => {
		const g1 = new StringGenerator( ranS, 1 );
		expect( g1.isZeroBetweenMinAndMax() ).toBeFalsy();
		const g2 = new StringGenerator( ranS, 0 );
		expect( g2.isZeroBetweenMinAndMax() ).toBeTruthy();
	} );

	it( 'indicates when zero is below min', () => {
		const g1 = new StringGenerator( ranS, 1 );
		expect( g1.isZeroBelowMin() ).toBeTruthy
		const g2 = new StringGenerator( ranS, 0 );
		expect( g2.isZeroBelowMin() ).toBeFalsy();
	} );

	it( 'indicates when zero is above max', () => {
		const g1 = new StringGenerator( ranS, 0, 1 );
		expect( g1.isZeroAboveMax() ).toBeFalsy();
		const g2 = new StringGenerator( ranS, 0, 0 );
		expect( g2.isZeroAboveMax() ).toBeFalsy();
	} );

    it( 'lowest', () => {
        expect( gen.lowest().length ).toBe( 0 );
    } );

    it( 'random below min', () => {
        expect( gen.randomBelowMin().length ).toBeLessThan( aMin );
    } );

    it( 'just below min', () => {
        expect( gen.justBelowMin().length ).toBe( aMin - 1 );
    } );

    it( 'just above min', () => {
        expect( gen.justAboveMin().length ).toBe( aMin + 1 );
    } );

    it( 'median value', () => {
        expect( gen.median().length ).toBe( aMedian );
        const gen2: StringGenerator = new StringGenerator( ranS, 1, 1 );
        expect( gen2.median().length ).toBe( 1 );
    } );

    it( 'random between min and max', () => {
        const val = gen.randomBetweenMinAndMax().length;
        expect( val ).toBeGreaterThan( aMin );
        expect( val ).toBeLessThan( aMax );
    } );

    it( 'just below max', () => {
        expect( gen.justBelowMax().length ).toBe( aMax - 1 );
    } );

    it( 'just above max', () => {
        expect( gen.justAboveMax().length ).toBe( aMax + 1 );
    } );

    it( 'random above max', () => {
        expect( gen.randomAboveMax().length ).toBeGreaterThan( aMax );
    } );

    it( 'accepts custom max possible length', () => {
        const MAX_POSSIBLE_LENGTH = 100;
        let newGen = new StringGenerator( ranS, aMin, aMax, MAX_POSSIBLE_LENGTH );
        expect( newGen.greatest().length ).toBe( MAX_POSSIBLE_LENGTH );
    } );

} );
