import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH`
 */
export class RandomBelowMinimumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.minlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Since RandomBelowMinimumLength covers SOME predecessor,
		// Empty covers 0, and BelowMinimumLength covers 1,
		// minimumLength should be 3+ to have at least one uncovered value.
		if ( cfg.minlength.value <= 2 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minlength.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
