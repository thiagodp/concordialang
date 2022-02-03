import { isDefined } from '../../../util/type-checking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH`
 */
export class RandomBetweenMinimumAndMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.minlength || ! cfg.maxlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		const freeValues = cfg.maxlength.value - cfg.minlength.value;
		// It should have 3+ free values, since two of them will be covered
		// by JustAboveMinimumLength and JustBelowMaximumLength
		if ( freeValues <= 2 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
