import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH`
 */
export class RandomBelowMinimumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Since RandomBelowMinimumLength covers SOME predecessor,
		// Empty covers 0, and BelowMinimumLength covers 1,
		// minimumLength should be 3+ to have at least one uncovered value.
		if ( cfg.minimumLength <= 2 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minimumLengthWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
