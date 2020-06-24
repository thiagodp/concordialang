import { minLimitOfType } from 'modules/testdata/limits/limits';
import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.LOWEST_VALUE`
 */
export class LowestValue extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.format ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.minimumValue ) ) {

			if ( cfg.minimumValue === minLimitOfType( cfg.dataType ) ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
