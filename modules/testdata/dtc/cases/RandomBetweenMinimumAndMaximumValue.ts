import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE`
 */
export class RandomBetweenMinimumAndMaximumValue implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumValue ) ||
			! isDefined( cfg.maximumValue ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maximumLength === cfg.minimumLength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
