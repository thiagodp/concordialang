import { LocalDate, LocalTime, LocalDateTime } from "@js-joda/core";
import { AnyValue } from "./AnyValue";
import { ValueType } from "../../util/ValueTypeDetector";

export class Cfg {

	withOnlyValidDTC: boolean = false;

	invertedLogic: boolean = false;
	dataType: ValueType = ValueType.STRING;

	value?: AnyValue;
	valueWithOnlyValidDTC: boolean = false;

	required?: boolean;
	requiredWithOnlyValidDTC: boolean = false;

	minimumLength?: number;
	minimumLengthWithOnlyValidDTC: boolean = false;

	maximumLength?: number;
	maximumLengthWithOnlyValidDTC: boolean = false;

	minimumValue?: number | LocalDate | LocalTime | LocalDateTime;
	minimumValueWithOnlyValidDTC: boolean = false;

	maximumValue?: number | LocalDate | LocalTime | LocalDateTime;
	maximumValueWithOnlyValidDTC: boolean = false;

	format?: string;
	formatWithOnlyValidDTC: boolean = false;

}
