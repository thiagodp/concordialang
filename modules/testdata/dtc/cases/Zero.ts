import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.ZERO`
 */
export class Zero implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype &&
			cfg.datatype.value !== ValueType.INTEGER &&
			cfg.datatype.value !== ValueType.DOUBLE
		) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( cfg.format ||
			cfg.value ||
			cfg.minlength ||
			cfg.maxlength
		) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Minimum value
		const minValue = cfg.minvalue?.value;
		if ( typeof minValue === 'number' ) {

			// There is already data test cases that cover these situations:
			if ( 0 === minValue ||
				0 === +minValue - 1 ||
				0 === +minValue + 1
			) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( minValue > 0 ) {

				if ( cfg.minvalue?.onlyValidDTC ) {
					return ExpectedResult.INCOMPATIBLE;
				}

				return ExpectedResult.INVALID;
			}
		}

		// Maximum value
		const maxValue = cfg.maxvalue?.value;
		if ( typeof maxValue === 'number' ) {

			// There is already data test cases that cover these situations:
			if ( 0 === maxValue ||
				0 === +maxValue - 1 ||
				0 === +maxValue + 1
				) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( maxValue < 0 ) {

				if ( cfg.maxvalue?.onlyValidDTC ) {
					return ExpectedResult.INCOMPATIBLE;
				}

				return ExpectedResult.INVALID;
			}
		}

		return ExpectedResult.VALID;
	}

}
