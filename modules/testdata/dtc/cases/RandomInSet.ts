import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.RANDOM_IN_SET`
 */
export class RandomInSet implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( isDefined( cfg.value ) &&
			Array.isArray( cfg.value ) &&
			cfg.value.length >= 2
		) {
			return ExpectedResult.VALID;
		}

		return ExpectedResult.INCOMPATIBLE;
	}

}

