import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_ABOVE_MINIMUM_VALUE`
 */
export class JustAboveMinimumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumValue ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumValue ) ) {
			// It should have at least one free value
			if ( cfg.minimumValue === cfg.maximumValue ) { // integer
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		return ExpectedResult.VALID;
	}

}
