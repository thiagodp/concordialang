import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_BELOW_MAXIMUM_LENGTH`
 */
export class JustBelowMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.minimumLength ) ) {
			const freeValues = cfg.maximumLength - cfg.minimumLength;
			// It should have at least 2 values between them, since
			// JustAboveMinimumLength will cover one of them.
			if ( freeValues <= 1 ) {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		return ExpectedResult.VALID;
	}

}
