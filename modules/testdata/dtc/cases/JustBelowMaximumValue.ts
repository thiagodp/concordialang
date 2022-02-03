import { ValueType } from '../../../util/ValueTypeDetector';
import { hasFreeValuesBetweenThem, PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MAXIMUM_VALUE`
 */
export class JustBelowMaximumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype?.value === ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.maxvalue ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minvalue ) {
			if ( ! hasFreeValuesBetweenThem( cfg.minvalue.value, cfg.maxvalue.value ) ) {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		return ExpectedResult.VALID;
	}

}
