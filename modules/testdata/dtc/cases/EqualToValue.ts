import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.EQUAL_TO_VALUE`
 */
export class EqualToValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		// Doesn't it have a value ?
		if ( ! cfg.value ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		let value = cfg.value.value;

		// Is it an array ?
		if ( Array.isArray( value ) ) {

			// More than one value ?
			if ( value.length > 1 ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			value = value[ 0 ]; // First element
		}

		// Is it required ?
		if ( cfg.required?.value === true ) {
			// Required but empty
			if ( value === '' ) {
				if ( cfg.required.onlyValidDTC ) {
					return ExpectedResult.INCOMPATIBLE;
				}
				return ExpectedResult.INVALID;
			}
			// Required and not empty
			return ExpectedResult.VALID;
		}
		// Not required
		else if ( ! cfg.required?.value ) {
			return ExpectedResult.VALID;
		}
		// Required not defined
		return ExpectedResult.INCOMPATIBLE;
	}

}
