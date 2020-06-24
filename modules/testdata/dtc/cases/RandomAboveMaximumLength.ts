import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { StringLimits } from '../../limits/StringLimits';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH`
 */
export class RandomAboveMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		const freeValues = StringLimits.MAX - cfg.maximumLength;
		// It should have 2+ free values, since JustAboveMaximumLength covers
		// one of them
		if ( freeValues <= 1 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maximumLengthWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
