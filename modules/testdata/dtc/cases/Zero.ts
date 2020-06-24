import { ValueType } from "modules/util";
import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.ZERO`
 */
export class Zero extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.INTEGER &&
			cfg.dataType !== ValueType.DOUBLE ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.format ) ||
			isDefined( cfg.value ) ||
			isDefined( cfg.minimumLength ) ||
			isDefined( cfg.maximumLength )
		) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Minimum value
		if ( 'number' === typeof cfg.minimumValue ) {

			// There is already data test cases that cover these situations:
			if ( 0 === cfg.minimumValue ||
				0 === +cfg.minimumValue - 1 ||
				0 === +cfg.minimumValue + 1
				) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( cfg.minimumValue > 0 ) {
				return ExpectedResult.INVALID;
			}
		}

		// Maximum value
		if ( 'number' === typeof cfg.maximumValue ) {

			// There is already data test cases that cover these situations:
			if ( 0 === cfg.maximumValue ||
				0 === +cfg.maximumValue - 1 ||
				0 === +cfg.maximumValue + 1
				) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( cfg.maximumValue < 0 ) {
				return ExpectedResult.INVALID;
			}
		}

		return ExpectedResult.VALID;
	}

}
