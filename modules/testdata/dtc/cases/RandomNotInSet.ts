import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.RANDOM_NOT_IN_SET`
 */
export class RandomNotInSet extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( isDefined( cfg.value ) &&
			Array.isArray( cfg.value ) &&
			cfg.value.length >= 2
		) {
			return ExpectedResult.INVALID;
		}

		return ExpectedResult.INCOMPATIBLE;
	}

}

