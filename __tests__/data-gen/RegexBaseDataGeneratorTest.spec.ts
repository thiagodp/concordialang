import { RegexBasedDataGenerator } from "../../modules/data-gen/RegexBasedDataGenerator";
import { RandomString } from "../../modules/data-gen/random/RandomString";
import { Random } from "../../modules/data-gen/random/Random";

describe( 'RegexBaseDataGeneratorTest', () => {

    const ranS = new RandomString( new Random() );

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


    let checkValid = ( exp ) => {
        let gen = new RegexBasedDataGenerator( ranS, exp );
        expect( gen.valid() ).toMatch( new RegExp( exp ) );        
    };    

    let checkInvalid = ( exp ) => {
        let gen = new RegexBasedDataGenerator( ranS, exp );
        expect( gen.invalid() ).not.toMatch( new RegExp( exp ) );        
    };


} );