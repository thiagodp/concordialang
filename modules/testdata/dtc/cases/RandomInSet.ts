import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.RANDOM_IN_SET`
 */
export class RandomInSet implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.value &&
			Array.isArray( cfg.value.value ) &&
			cfg.value.value.length >= 2
		) {
			return ExpectedResult.VALID;
		}

		return ExpectedResult.INCOMPATIBLE;
	}

}

