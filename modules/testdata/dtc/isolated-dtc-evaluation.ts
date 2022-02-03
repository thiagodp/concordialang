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
import { PropCfg } from './prop-cfg';
import { DataTestCase } from './DataTestCase';
import { ExpectedResult } from './ExpectedResult';

/**
 * Evaluates applicable data test cases for the given UI Element configuration.
 *
 * @param cfg Configuration
 * @param uieWithOnlyValidDTC Indicates if the UI Element should have only valid Data Test Cases
 */
export function evaluateDataTestCases( cfg: PropCfg, uieWithOnlyValidDTC?: boolean ): Map< DataTestCase, ExpectedResult > {

	const map = new Map< DataTestCase, ExpectedResult >();

	const cases: DataTestCase[] = enumUtil.getValues( DataTestCase );
	for ( const dtc of cases ) {
		let e: ExpectedResult = evaluateSingleDataTestCase( dtc, cfg );
		if ( cfg.invertedLogic ) {
			e = invertValidity( e );
		}
		if ( uieWithOnlyValidDTC && ExpectedResult.INVALID === e ) {
			e = ExpectedResult.INCOMPATIBLE;
		}
		map.set( dtc, e );
	}

    return map;
}

/**
 * Evaluates the result of a given Data Test Case for a given configuration.
 *
 * @param cfg Configuration
 */
function evaluateSingleDataTestCase( dtc: DataTestCase, cfg: PropCfg ): ExpectedResult {

	switch ( dtc ) {

		case DataTestCase.RANDOM_VALUE:
			return ( new RandomValue() ).analyze( cfg );

		// Value

		case DataTestCase.EQUAL_TO_VALUE:
			return ( new EqualToValue() ).analyze( cfg );

		case DataTestCase.RANDOM_DIFFERENT_FROM_VALUE:
			return ( new RandomDifferentFromValue() ).analyze( cfg );

		// Set

		case DataTestCase.RANDOM_IN_SET:
			return ( new RandomInSet() ).analyze( cfg );

		case DataTestCase.RANDOM_NOT_IN_SET:
			return ( new RandomNotInSet() ).analyze( cfg );

		// Number

		case DataTestCase.ZERO:
			return ( new Zero() ).analyze( cfg );

		// String

		case DataTestCase.EMPTY:
			return ( new Empty() ).analyze( cfg );

		case DataTestCase.GREATEST_LENGTH:
			return ( new GreatestLength() ).analyze( cfg );

		// Minimum length

		case DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH:
			return ( new RandomBelowMinimumLength() ).analyze( cfg );

		case DataTestCase.JUST_BELOW_MINIMUM_LENGTH:
			return ( new JustBelowMinimumLength() ).analyze( cfg );

		case DataTestCase.EQUAL_TO_MINIMUM_LENGTH:
			return ( new EqualToMinimumLength() ).analyze( cfg );

		case DataTestCase.JUST_ABOVE_MINIMUM_LENGTH:
			return ( new JustAboveMinimumLength() ).analyze( cfg );

		// Maximum length

		case DataTestCase.JUST_BELOW_MAXIMUM_LENGTH:
			return ( new JustBelowMaximumLength() ).analyze( cfg );

		case DataTestCase.EQUAL_TO_MAXIMUM_LENGTH:
			return ( new EqualToMaximumLength() ).analyze( cfg );

		case DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH:
			return ( new JustAboveMaximumLength() ).analyze( cfg );

		case DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH:
			return ( new RandomAboveMaximumLength() ).analyze( cfg );

		// Minimum length & Maximum length

		case DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH:
			return ( new RandomBetweenMinimumAndMaximumLength() ).analyze( cfg );

		// Minimum value

		case DataTestCase.LOWEST_VALUE:
			return ( new LowestValue() ).analyze( cfg );

		case DataTestCase.RANDOM_BELOW_MINIMUM_VALUE:
			return ( new RandomBelowMinimumValue() ).analyze( cfg );

		case DataTestCase.JUST_BELOW_MINIMUM_VALUE:
			return ( new JustBelowMinimumValue() ).analyze( cfg );

		case DataTestCase.EQUAL_TO_MINIMUM_VALUE:
			return ( new EqualToMinimumValue() ).analyze( cfg );

		case DataTestCase.JUST_ABOVE_MINIMUM_VALUE:
			return ( new JustAboveMinimumValue() ).analyze( cfg );

		// Maximum value

		case DataTestCase.JUST_BELOW_MAXIMUM_VALUE:
			return ( new JustBelowMaximumValue() ).analyze( cfg );

		case DataTestCase.EQUAL_TO_MAXIMUM_VALUE:
			return ( new EqualToMaximumValue() ).analyze( cfg );

		case DataTestCase.JUST_ABOVE_MAXIMUM_VALUE:
			return ( new JustAboveMaximumValue() ).analyze( cfg );

		case DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE:
			return ( new RandomAboveMaximumValue() ).analyze( cfg );

		case DataTestCase.GREATEST_VALUE:
			return ( new GreatestValue() ).analyze( cfg );

		// Minimum value & Maximum value

		case DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE:
			return ( new RandomBetweenMinimumAndMaximumValue() ).analyze( cfg );

		case DataTestCase.MEDIAN_VALUE:
			return ( new MedianValue() ).analyze( cfg );

		// Format

		case DataTestCase.RANDOM_FROM_FORMAT:
			return ( new RandomFromFormat() ).analyze( cfg );

		case DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT:
			return ( new RandomDifferentFromFormat() ).analyze( cfg );

	}

	return ExpectedResult.INCOMPATIBLE;
}

/**
 * Inverts the validity of a result.
 *
 * @param result Result to be inverted.
 * @returns
 */
function invertValidity( result: ExpectedResult ): ExpectedResult {
	switch ( result ) {
		case ExpectedResult.VALID: return ExpectedResult.INVALID;
		case ExpectedResult.INVALID: return ExpectedResult.VALID;
		default: return result;
	}
}
