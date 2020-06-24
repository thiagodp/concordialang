import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.RANDOM_NOT_IN_SET`
 */
export class RandomNotInSet implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		if ( isDefined( cfg.value ) &&
			Array.isArray( cfg.value ) &&
			cfg.value.length >= 2
		) {

			if ( cfg.valueWithOnlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.INCOMPATIBLE;
	}

}

