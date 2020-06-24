import * as enumUtil from 'enum-util';

import {
    Empty,
    EqualToMaximumLength,
    EqualToMaximumValue,
    EqualToMinimumLength,
    EqualToMinimumValue,
    EqualToValue,
    GreatestLength,
    GreatestValue,
    JustAboveMaximumLength,
    JustAboveMaximumValue,
    JustAboveMinimumLength,
    JustAboveMinimumValue,
    JustBelowMaximumLength,
    JustBelowMaximumValue,
    JustBelowMinimumLength,
    JustBelowMinimumValue,
    LowestValue,
    RandomAboveMaximumLength,
    RandomBelowMinimumLength,
    RandomBetweenMinimumAndMaximumLength,
    RandomDifferentFromFormat,
    RandomDifferentFromValue,
    RandomFromFormat,
    RandomInSet,
    RandomNotInSet,
    RandomValue,
    Zero,
} from './cases';
import { MedianValue } from './cases/MedianValue';
import { RandomAboveMaximumValue } from './cases/RandomAboveMaximumValue';
import { RandomBelowMinimumValue } from './cases/RandomBelowMinimumValue';
import { RandomBetweenMinimumAndMaximumValue } from './cases/RandomBetweenMinimumAndMaximumValue';
import { Cfg } from './Cfg';
import { DataTestCase } from './DataTestCase';
import { ExpectedResult } from './ExpectedResult';

/**
 * Evaluates all the data test cases applicable to the given configuration.
 *
 * @param cfg Configuration
 */
export function evaluateDataTestCases( cfg: Cfg ): Map< DataTestCase, ExpectedResult > {

	const map = new Map< DataTestCase, ExpectedResult >();

	const cases: DataTestCase[] = enumUtil.getValues( DataTestCase );
	for ( const dtc of cases ) {
		let e: ExpectedResult = evaluateSingleDataTestCase( dtc, cfg );
		if ( true === cfg.invertedLogic ) {
			e = invertValidity( e );
		}
		if ( true === cfg.withOnlyValidDTC && ExpectedResult.INVALID === e ) {
			e = ExpectedResult.INCOMPATIBLE;
		}
		map.set( dtc, e );
	}

    return map;
}

/**
 * Evaluates a data test cases against the given configuration.
 *
 * @param cfg Configuration
 */
function evaluateSingleDataTestCase( dtc: DataTestCase, cfg: Cfg ): ExpectedResult {

	switch ( dtc ) {

		case DataTestCase.RANDOM_VALUE:
			return ( new RandomValue() ).pre( cfg );

		// Value

		case DataTestCase.EQUAL_TO_VALUE:
			return ( new EqualToValue() ).pre( cfg );

		case DataTestCase.RANDOM_DIFFERENT_FROM_VALUE:
			return ( new RandomDifferentFromValue() ).pre( cfg );

		// Set

		case DataTestCase.RANDOM_IN_SET:
			return ( new RandomInSet() ).pre( cfg );

		case DataTestCase.RANDOM_NOT_IN_SET:
			return ( new RandomNotInSet() ).pre( cfg );

		// Number

		case DataTestCase.ZERO:
			return ( new Zero() ).pre( cfg );

		// String

		case DataTestCase.EMPTY:
			return ( new Empty() ).pre( cfg );

		case DataTestCase.GREATEST_LENGTH:
			return ( new GreatestLength() ).pre( cfg );

		// Minimum length

		case DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH:
			return ( new RandomBelowMinimumLength() ).pre( cfg );

		case DataTestCase.JUST_BELOW_MINIMUM_LENGTH:
			return ( new JustBelowMinimumLength() ).pre( cfg );

		case DataTestCase.EQUAL_TO_MINIMUM_LENGTH:
			return ( new EqualToMinimumLength() ).pre( cfg );

		case DataTestCase.JUST_ABOVE_MINIMUM_LENGTH:
			return ( new JustAboveMinimumLength() ).pre( cfg );

		// Maximum length

		case DataTestCase.JUST_BELOW_MAXIMUM_LENGTH:
			return ( new JustBelowMaximumLength() ).pre( cfg );

		case DataTestCase.EQUAL_TO_MAXIMUM_LENGTH:
			return ( new EqualToMaximumLength() ).pre( cfg );

		case DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH:
			return ( new JustAboveMaximumLength() ).pre( cfg );

		case DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH:
			return ( new RandomAboveMaximumLength() ).pre( cfg );

		// Minimum length & Maximum length

		case DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH:
			return ( new RandomBetweenMinimumAndMaximumLength() ).pre( cfg );

		// Minimum value

		case DataTestCase.LOWEST_VALUE:
			return ( new LowestValue() ).pre( cfg );

		case DataTestCase.RANDOM_BELOW_MINIMUM_VALUE:
			return ( new RandomBelowMinimumValue() ).pre( cfg );

		case DataTestCase.JUST_BELOW_MINIMUM_VALUE:
			return ( new JustBelowMinimumValue() ).pre( cfg );

		case DataTestCase.EQUAL_TO_MINIMUM_VALUE:
			return ( new EqualToMinimumValue() ).pre( cfg );

		case DataTestCase.JUST_ABOVE_MINIMUM_VALUE:
			return ( new JustAboveMinimumValue() ).pre( cfg );

		// Maximum value

		case DataTestCase.JUST_BELOW_MAXIMUM_VALUE:
			return ( new JustBelowMaximumValue() ).pre( cfg );

		case DataTestCase.EQUAL_TO_MAXIMUM_VALUE:
			return ( new EqualToMaximumValue() ).pre( cfg );

		case DataTestCase.JUST_ABOVE_MAXIMUM_VALUE:
			return ( new JustAboveMaximumValue() ).pre( cfg );

		case DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE:
			return ( new RandomAboveMaximumValue() ).pre( cfg );

		case DataTestCase.GREATEST_VALUE:
			return ( new GreatestValue() ).pre( cfg );

		// Minimum value & Maximum value

		case DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE:
			return ( new RandomBetweenMinimumAndMaximumValue() ).pre( cfg );

		case DataTestCase.MEDIAN_VALUE:
			return ( new MedianValue() ).pre( cfg );

		// Format

		case DataTestCase.RANDOM_FROM_FORMAT:
			return ( new RandomFromFormat() ).pre( cfg );

		case DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT:
			return ( new RandomDifferentFromFormat() ).pre( cfg );

	}

	return ExpectedResult.INCOMPATIBLE;
}


function invertValidity( result: ExpectedResult ): ExpectedResult {
	switch ( result ) {
		case ExpectedResult.VALID: return ExpectedResult.INVALID;
		case ExpectedResult.INVALID: return ExpectedResult.VALID;
		default: return result;
	}
}
