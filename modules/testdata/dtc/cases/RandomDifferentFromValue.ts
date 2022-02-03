import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_DIFFERENT_FROM_VALUE`
 */
export class RandomDifferentFromValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		// Doesn't it have a value ?
		if ( ! cfg.value ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		const value = cfg.value.value;

		// Is it an array ?
		if ( Array.isArray( value ) ) {
			// More than one value ?
			if ( value.length > 1 ) {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		if ( cfg.value.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
