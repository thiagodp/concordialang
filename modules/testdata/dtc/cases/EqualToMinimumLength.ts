import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.EQUAL_TO_MINIMUM_LENGTH`
 */
export class EqualToMinimumLength extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! isDefined( cfg.minimumLength ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( 0 === cfg.minimumLength && true === cfg.required ) {
			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
