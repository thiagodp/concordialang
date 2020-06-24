import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.EMPTY`
 */
export class Empty extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		// Required
		if ( true === cfg.required ) {
			return ExpectedResult.INVALID;
		}

		// Value
		if ( '' === cfg.value ) {
			return ExpectedResult.VALID;
		}

		// Minimum length
		if ( isDefined( cfg.minimumLength ) ) {

			if ( 0 === cfg.minimumLength ) {
				return ExpectedResult.VALID;
			}

			return ExpectedResult.INVALID;
		}

		// Format
		if ( isDefined( cfg.format ) ) {
			try {
				if ( new RegExp( cfg.format ).test( '' ) ) {
					return ExpectedResult.VALID;
				}
				return ExpectedResult.INVALID;
			} catch {
				return ExpectedResult.INCOMPATIBLE;
			}
		}

		// Maximum length ignored -> irrelevant
		// Minimum value -> incompatible
		// Maximum value -> incompatible

		return ExpectedResult.INCOMPATIBLE;
	}

}
