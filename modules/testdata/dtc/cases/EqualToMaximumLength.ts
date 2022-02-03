import { ValueType } from '../../../util/ValueTypeDetector';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';


/**
 * Evaluate `DataTestCase.EQUAL_TO_MAXIMUM_LENGTH`
 */
export class EqualToMaximumLength implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		if ( cfg.datatype && cfg.datatype.value !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( ! cfg.maxlength ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		// Equal ? Then it's already covered by minimum length
		if ( cfg.minlength && cfg.minlength.value === cfg.maxlength.value ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}
