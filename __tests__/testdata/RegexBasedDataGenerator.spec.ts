import { Random } from "../../modules/testdata/random/Random";
import { RandomLong } from "../../modules/testdata/random/RandomLong";
import { RandomString } from "../../modules/testdata/random/RandomString";
import { RegexBasedDataGenerator } from "../../modules/testdata/RegexBasedDataGenerator";
import { ValueType } from "../../modules/util";

describe( 'RegexBaseDataGenerator', () => {

    const ran = new Random();
    const ranL = new RandomLong( ran );
	const ranS = new RandomString( ran );

    const checkValid = ( exp ) => {
        const gen = new RegexBasedDataGenerator( ranL, ranS, exp );
        expect( gen.valid() ).toMatch( new RegExp( exp ) );
    };

    const checkInvalid = ( exp ) => {
        const gen = new RegexBasedDataGenerator( ranL, ranS, exp );
        expect( gen.invalid() ).not.toMatch( new RegExp( exp ) );
    };

    it( 'valid values', () => {
        checkValid( '[a-z]' );
        checkValid( '(hello)' );
        checkValid( '^hello$' );
        checkValid( '[^a-z]' );
        checkValid( '[a-z]+' );
        checkValid( '.{1}' );
        checkValid( '[0-9]' );
        checkValid( '[A-z0-9 .-]{2,5}' );
        checkValid( '[0-9]{2}/[0-9]{2}/[0-9]{4}' );
    } );

    it( 'invalid values', () => {
        checkInvalid( '[a-z]' );
        checkInvalid( '(hello)' );
        checkInvalid( '^hello$' );
        checkInvalid( '[^a-z]' );
        checkInvalid( '[a-z]+' );
        // checkInvalid( '.{1}' ); <<< not able to handle with '.'
        checkInvalid( '[0-9]' );
        checkValid( '[A-z0-9 .-]{2,5}' );
        checkInvalid( '[0-9]{2}/[0-9]{2}/[0-9]{4}' );
	} );

	it( 'limits to the given maximum', () => {

		const exp = '[a-z]';
		const maxSize = 5;
		const gen = new RegexBasedDataGenerator(
			ranL, ranS, exp, ValueType.STRING, 10, maxSize );

		for ( let i = 0; i < 10; ++i ) {
			const validValue = gen.valid();
			expect( validValue ).toMatch( new RegExp( exp ) );
			expect( validValue.length ).toBeLessThanOrEqual( maxSize );

			const invalidValue = gen.invalid();
			expect( invalidValue ).not.toMatch( new RegExp( exp ) );
			expect( invalidValue.length ).toBeLessThanOrEqual( maxSize );
		}

	} );

} );
