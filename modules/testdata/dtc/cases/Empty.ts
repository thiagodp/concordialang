import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.EMPTY`
 */
export class Empty  implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		// Required
		if ( cfg.required ) {
			if ( cfg.required.onlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}
			return ExpectedResult.INVALID;
		}

		// Value
		if ( cfg.value && cfg.value.value === '' ) {
			return ExpectedResult.VALID;
		}

		// Minimum length
		if ( cfg.minlength ) {

			if ( cfg.minlength.value === 0 ) {
				return ExpectedResult.VALID;
			}

			if ( cfg.minlength.onlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		// Format
		if ( cfg.format ) {
			try {
				if ( new RegExp( cfg.format.value ).test( '' ) ) {
					return ExpectedResult.VALID;
				}

				if ( cfg.format.onlyValidDTC ) {
					return ExpectedResult.INCOMPATIBLE;
				}

				return ExpectedResult.INVALID;
			} catch {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		// Maximum length ignored -> irrelevant
		// Minimum value -> incompatible
		// Maximum value -> incompatible

		return ExpectedResult.INCOMPATIBLE;

	}

}
