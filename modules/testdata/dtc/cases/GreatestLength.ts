import { ValueType } from '../../../util/ValueTypeDetector';
import { StringLimits } from '../../limits/StringLimits';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.GREATEST_LENGTH`
 */
export class GreatestLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.format ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxlength ) {

			// Equal to the MAX ? Not needed since there is EqualToMaximumLength
			if ( cfg.maxlength.value === StringLimits.MAX ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( cfg.maxlength.onlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
