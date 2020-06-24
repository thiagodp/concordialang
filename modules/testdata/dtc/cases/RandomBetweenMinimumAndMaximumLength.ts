import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH`
 */
export class RandomBetweenMinimumAndMaximumLength extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumLength ) ||
			! isDefined( cfg.maximumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		const freeValues = cfg.maximumLength - cfg.minimumLength;
		// It should have 3+ free values, since two of them will be covered
		// by JustAboveMinimumLength and JustBelowMaximumLength
		if ( freeValues <= 2 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
