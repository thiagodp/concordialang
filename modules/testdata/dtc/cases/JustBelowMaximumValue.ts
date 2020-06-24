import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MAXIMUM_VALUE`
 */
export class JustBelowMaximumValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumValue ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// No free values between them
		if ( cfg.maximumValue === cfg.minimumValue ) { // integer only
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
