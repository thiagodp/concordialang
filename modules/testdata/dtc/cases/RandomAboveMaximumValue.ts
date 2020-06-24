import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { StringLimits } from '../../limits/StringLimits';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';
import { maxLimitOfType } from 'modules/testdata/limits/limits';

/**
 * Evaluate `DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE`
 */
export class RandomAboveMaximumValue implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumValue ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// No free values above
		if ( cfg.maximumValue === maxLimitOfType( cfg.dataType ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maximumValueWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
