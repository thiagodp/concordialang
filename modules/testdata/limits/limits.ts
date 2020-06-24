import { ValueType } from "../../util/ValueTypeDetector";
import { LongLimits } from "./LongLimits";
import { DoubleLimits } from "./DoubleLimits";
import { StringLimits } from "./StringLimits";
import { DateLimits } from "./DateLimits";
import { ShortTimeLimits, TimeLimits } from "./TimeLimits";
import { DateTimeLimits, ShortDateTimeLimits } from "./DateTimeLimits";


export function maxLimitOfType< T >( t: ValueType ): T | any {
	switch ( t ) {
		case ValueType.BOOLEAN: return true;
		case ValueType.INTEGER: return LongLimits.MAX;
		case ValueType.DOUBLE: return DoubleLimits.MAX;
		case ValueType.STRING: return StringLimits.MAX;
		case ValueType.DATE: return DateLimits.MAX;
		case ValueType.TIME: return ShortTimeLimits.MAX;
		case ValueType.LONG_TIME: return TimeLimits.MAX;
		case ValueType.DATE_TIME: return ShortDateTimeLimits.MAX;
		case ValueType.LONG_DATE_TIME: return DateTimeLimits.MAX;
		default: return null;
	}
}

export function minLimitOfType< T >( t: ValueType ): T | any {
	switch ( t ) {
		case ValueType.BOOLEAN: return false;
		case ValueType.INTEGER: return LongLimits.MIN;
		case ValueType.DOUBLE: return DoubleLimits.MIN;
		case ValueType.STRING: return StringLimits.MIN;
		case ValueType.DATE: return DateLimits.MIN;
		case ValueType.TIME: return ShortTimeLimits.MIN;
		case ValueType.LONG_TIME: return TimeLimits.MIN;
		case ValueType.DATE_TIME: return ShortDateTimeLimits.MIN;
		case ValueType.LONG_DATE_TIME: return DateTimeLimits.MIN;
		default: return null;
	}
}
