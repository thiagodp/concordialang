import { StringLimits } from '../../../testdata/limits/StringLimits';
import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH`
 */
export class JustAboveMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.maxlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxlength.value === StringLimits.MAX ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxlength.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
