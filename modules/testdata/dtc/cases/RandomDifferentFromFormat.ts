import { isDefined } from '../../../util/type-checking';
import { PropCfg } from "../prop-cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT`
 */
export class RandomDifferentFromFormat implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( ! cfg.format ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.format.onlyValidDTC ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.INVALID;
	}

}

