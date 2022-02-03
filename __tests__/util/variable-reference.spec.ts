import {
    extractFeatureNameOf,
    extractVariableReferences,
    makeVariableName,
    VariableExtractionResult,
} from '../../modules/util/variable-reference';

describe( 'variable-reference', () => {

	describe( 'extractUIEOrPropertyReference', () => {

		it.each( [
			[ '', null ],
			[ '{:}', null ],
			[ '{:|}', null ],

			[ '{UIE}', { uie: 'UIE' } ],
			[ '{Feature:UIE}', { feature: 'Feature', uie: 'UIE' } ],
			[ '{Feature:UIE|property}', { feature: 'Feature', uie: 'UIE', property: 'property' } ],

			[ 'UIE', { uie: 'UIE' } ],
			[ 'Feature:UIE', { feature: 'Feature', uie: 'UIE' } ],
			[ 'Feature:UIE|property', { feature: 'Feature', uie: 'UIE', property: 'property' } ],

			[ '{ UIE    }', { uie: 'UIE' } ],
			[ '{  Feature :  UIE  }', { feature: 'Feature', uie: 'UIE' } ],
			[ '{  Feature :  UIE |  property }', { feature: 'Feature', uie: 'UIE', property: 'property' } ],

		] )( '%s -> %s', ( input: string, expected: VariableExtractionResult | null ) => {
			const r = extractVariableReferences( input );
			expect( r ).toEqual( expected );
		} );

	} );


	describe( 'extractFeatureNameOf', () => {

		it.each( [
			[ '', null ],
			[ '{:}', null ],
			[ '{:|}', null ],

			[ '{UIE}', null ],
			[ '{Feature:UIE}', 'Feature' ],
			[ '{Feature:UIE|property}', 'Feature' ],

			[ 'UIE', null ],
			[ 'Feature:UIE', 'Feature' ],
			[ 'Feature:UIE|property', 'Feature' ],

			[ '{ UIE    }', null ],
			[ '{  Feature :  UIE  }', 'Feature' ],
			[ '{  Feature :  UIE |  property }', 'Feature' ],

		] )( '%s -> %s', ( input: string, expected: string | null ) => {
			const r = extractFeatureNameOf( input );
			expect( r ).toEqual( expected );
		} );

	} );



	describe( 'makeVariableName', () => {

		it.each( [
			[ '', '', false, '' ],
			[ '', '', true, '{}' ],

			[ 'Feature', '', false, 'Feature:' ],
			[ 'Feature', '', true, '{Feature:}' ],

			[ '', 'UIE', false, 'UIE' ],
			[ '', 'UIE', true, '{UIE}' ],

			[ 'Feature', 'UIE', false, 'Feature:UIE' ],
			[ 'Feature', 'UIE', true, '{Feature:UIE}' ],

		] )( '%s, %s, %s -> %s', ( feature: string, uieName: string, surround: boolean, expected: string ) => {
			const r = makeVariableName( feature, uieName, surround );
			expect( r ).toEqual( expected );
		} );

	} );

} );
