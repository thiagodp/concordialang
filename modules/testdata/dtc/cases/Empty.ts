import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.EMPTY`
 */
export class Empty implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: Cfg ): ExpectedResult {

		// Required
		if ( cfg.required ) {
			if ( cfg.requiredWithOnlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}
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

			if ( cfg.minimumLengthWithOnlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		// Format
		if ( isDefined( cfg.format ) ) {
			try {
				if ( new RegExp( cfg.format ).test( '' ) ) {
					return ExpectedResult.VALID;
				}

				if ( cfg.formatWithOnlyValidDTC ) {
					return ExpectedResult.INCOMPATIBLE;
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
