import { isDefined } from '../../../util/type-checking';
import { PropCfg } from '../prop-cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluates `DataTestCase.RANDOM_VALUE`
 */
export class RandomValue implements DTCAnalyzer {

	/** @inheritdoc */
	analyze( cfg: PropCfg ): ExpectedResult {

		// All constraints but Required are accepted as incompatible
		if ( cfg.value ||
			cfg.format ||
			cfg.minlength ||
			cfg.maxlength ||
			cfg.minvalue ||
			cfg.maxvalue
		) {
			return ExpectedResult.INCOMPATIBLE;
		}

		return ExpectedResult.VALID;
	}

}

