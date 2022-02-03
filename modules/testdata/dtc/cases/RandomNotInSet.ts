import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.RANDOM_NOT_IN_SET`
 */
export class RandomNotInSet implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.value &&
			Array.isArray( cfg.value.value ) &&
			cfg.value.value.length >= 2
		) {

			if ( cfg.value.onlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.INCOMPATIBLE;
	}

}

