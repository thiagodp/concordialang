import { minLimitOfType } from '../../../testdata/limits/limits';
import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.LOWEST_VALUE`
 */
export class LowestValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype?.value === ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.format ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minvalue ) {

			if ( cfg.minvalue.value === minLimitOfType( cfg.datatype?.value ) ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( cfg.minvalue.onlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
