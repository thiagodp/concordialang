import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

/**
 * Evaluates `DataTestCase.EQUAL_TO_VALUE`
 */
export class EqualToValue implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

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

		const value = Array.isArray( cfg.value ) ? cfg.value[ 0 ] : cfg.value;

		// Is it required ?
		if ( true === cfg.required ) {
			// Required but empty
			if ( '' === value ) {
				if ( cfg.requiredWithOnlyValidDTC ) {
					return ExpectedResult.INCOMPATIBLE;
				}
				return ExpectedResult.INVALID;
			}
			// Required and not empty
			return ExpectedResult.VALID;
		}
		// Not required
		else if ( false === cfg.required ) {
			return ExpectedResult.VALID;
		}
		// Required not defined
		return ExpectedResult.INCOMPATIBLE;
	}

}
