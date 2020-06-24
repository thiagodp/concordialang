import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.EQUAL_TO_MINIMUM_LENGTH`
 */
export class EqualToMinimumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( 0 === cfg.minimumLength && cfg.required ) {

			if ( cfg.minimumLengthWithOnlyValidDTC || cfg.requiredWithOnlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
