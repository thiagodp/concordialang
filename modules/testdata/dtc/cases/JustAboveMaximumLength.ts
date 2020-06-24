import { StringLimits } from '../../../testdata/limits/StringLimits';
import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH`
 */
export class JustAboveMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maximumLength === StringLimits.MAX ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.maximumLengthWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
