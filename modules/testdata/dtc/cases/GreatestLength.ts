import { isDefined } from '../../../util/TypeChecking';
import { ValueType } from '../../../util/ValueTypeDetector';
import { StringLimits } from '../../limits/StringLimits';
import { Cfg } from '../Cfg';
import { DTCAnalyzer } from '../DTCAnalyzer';
import { ExpectedResult } from '../ExpectedResult';

/**
 * Evaluate `DataTestCase.GREATEST_LENGTH`
 */
export class GreatestLength implements DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {

		if ( cfg.dataType !== ValueType.STRING ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.format ) ) {
			return ExpectedResult.INCOMPATIBLE;
		}

		if ( isDefined( cfg.maximumLength ) ) {

			// Equal to the MAX ? Not needed since there is EqualToMaximumLength
			if ( cfg.maximumLength === StringLimits.MAX ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			if ( cfg.maximumLengthWithOnlyValidDTC ) {
				return ExpectedResult.INCOMPATIBLE;
			}

			return ExpectedResult.INVALID;
		}

		return ExpectedResult.VALID;
	}

}
