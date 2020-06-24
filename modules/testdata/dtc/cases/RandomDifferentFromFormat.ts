import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT`
 */
export class RandomDifferentFromFormat extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( ! isDefined( cfg.format ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}

