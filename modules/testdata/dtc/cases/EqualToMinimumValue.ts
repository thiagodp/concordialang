import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.EQUAL_TO_MINIMUM_VALUE`
 */
export class EqualToMinimumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype?.value === ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.minvalue ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
