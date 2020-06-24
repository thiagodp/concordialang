import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.JUST_ABOVE_MINIMUM_LENGTH`
 */
export class JustAboveMinimumLength extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// It should have at least one free value between them
		if ( cfg.maximumLength === cfg.minimumLength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
