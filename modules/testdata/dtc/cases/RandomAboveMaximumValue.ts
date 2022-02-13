import { maxLimitOfType } from '../../../testdata/limits/limits';
import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE`
 */
export class RandomAboveMaximumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype?.value === ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.maxvalue ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// No free values above
		if ( cfg.maxvalue.value === maxLimitOfType( cfg.datatype?.value ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxvalue.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}