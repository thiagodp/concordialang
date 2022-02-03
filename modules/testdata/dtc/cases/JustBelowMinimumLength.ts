import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MINIMUM_LENGTH`
 */
export class JustBelowMinimumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.minlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Since JustBelowMinimumLength covers the predecessor and Empty
		// covers 0, minimumLength should be 2+ in order to cover 1+
		if ( cfg.minlength?.value <= 1 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minlength?.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
