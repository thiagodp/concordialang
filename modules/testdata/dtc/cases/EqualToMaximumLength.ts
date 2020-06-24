import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.EQUAL_TO_MAXIMUM_LENGTH`
 */
export class EqualToMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.maximumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Equal ? Then it's already covered by minimum length
		if ( cfg.maximumLength === cfg.minimumLength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
