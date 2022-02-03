import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MAXIMUM_LENGTH`
 */
export class JustBelowMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.maxlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minlength ) {
			const freeValues = cfg.maxlength.value - cfg.minlength.value;
			// It should have at least 2 values between them, since
			// JustAboveMinimumLength will cover one of them.
			if ( freeValues <= 1 ) {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		return ExpectedResult.VALID;
	}

}
