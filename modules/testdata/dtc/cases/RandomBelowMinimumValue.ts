import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';
import { minLimitOfType } from 'modules/testdata/limits/limits';

/**
 * Evaluate `DataTestCase.RANDOM_BELOW_MINIMUM_VALUE`
 */
export class RandomBelowMinimumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumValue ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// No free values bellow
		if ( cfg.minimumValue === minLimitOfType( cfg.dataType ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minimumValueWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
