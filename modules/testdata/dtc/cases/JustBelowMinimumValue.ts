import { minLimitOfType } from 'modules/testdata/limits/limits';
import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MINIMUM_VALUE`
 */
export class JustBelowMinimumValue extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumValue ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// It should have at least one free value above
		if ( cfg.minimumValue === minLimitOfType( cfg.dataType ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
