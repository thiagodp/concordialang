import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluate `DataTestCase.RANDOM_DIFFERENT_FROM_VALUE`
 */
export class RandomDifferentFromValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		// Doesn't it have a value ?
		if ( ! isDefined( cfg.value ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Is it an array ?
		if ( Array.isArray( cfg.value ) ) {
			// More than one value ?
			if ( cfg.value.length > 1 ) {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		if ( cfg.valueWithOnlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}
