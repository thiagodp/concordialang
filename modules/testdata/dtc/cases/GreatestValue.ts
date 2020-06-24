import { maxLimitOfType } from 'modules/testdata/limits/limits';
import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.GREATEST_VALUE`
 */
export class GreatestValue implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( ValueType.STRING === cfg.dataType ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.format ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.maximumValue ) ) {

			if ( cfg.maximumValue === maxLimitOfType( cfg.dataType ) ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( cfg.maximumValueWithOnlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
