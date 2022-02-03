import { ValueType } from '../../../util/ValueTypeDetector';
import { hasFreeValuesBetweenThem, PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_ABOVE_MINIMUM_VALUE`
 */
export class JustAboveMinimumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype?.value === ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.minvalue ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxvalue ) {
			if ( ! hasFreeValuesBetweenThem( cfg.maxvalue.value, cfg.minvalue.value ) ) {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		return ExpectedResult.VALID;
	}

}
