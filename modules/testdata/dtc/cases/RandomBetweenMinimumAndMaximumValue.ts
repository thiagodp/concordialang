import { isDefined } from '../../../util/type-checking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE`
 */
export class RandomBetweenMinimumAndMaximumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype?.value === ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.minvalue || ! cfg.maxvalue ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maxlength.value === cfg.minlength.value ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
