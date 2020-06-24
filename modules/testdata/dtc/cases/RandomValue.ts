import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.RANDOM_VALUE`
 */
export class RandomValue implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		// All constraints but Required are accepted as incompatible
		if ( isDefined( cfg.value ) ||
			isDefined( cfg.format ) ||
			isDefined( cfg.minimumLength ) ||
			isDefined( cfg.maximumLength ) ||
			isDefined( cfg.minimumValue ) ||
			isDefined( cfg.maximumValue )
		) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}

