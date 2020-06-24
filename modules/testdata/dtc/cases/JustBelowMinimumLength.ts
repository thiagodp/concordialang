import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MINIMUM_LENGTH`
 */
export class JustBelowMinimumLength implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Since JustBelowMinimumLength covers the predecessor and Empty
		// covers 0, minimumLength should be 2+ in order to cover 1+
		if ( cfg.minimumLength <= 1 ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.minimumLengthWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
