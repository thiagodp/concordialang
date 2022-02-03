import { ValueType } from '../../../util/ValueTypeDetector';
import { StringLimits } from '../../limits/StringLimits';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH`
 */
export class RandomAboveMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.maxlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		const freeValues = StringLimits.MAX - cfg.maxlength.value;
		// It should have 2+ free values, since JustAboveMaximumLength covers
		// one of them
		if ( freeValues <= 1 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxlength.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
