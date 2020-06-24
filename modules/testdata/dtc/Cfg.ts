import { LocalDate, LocalTime, LocalDateTime } from "@js-joda/core";
import { AnyValue } from "./AnyValue";
import { ValueType } from "../../util/ValueTypeDetector";

export class Cfg {

	invertedLogic: boolean = false;
	dataType: ValueType = ValueType.STRING;

	value?: AnyValue;

	required?: boolean;
	minimumLength?: number;
	maximumLength?: number;
	minimumValue?: number | LocalDate | LocalTime | LocalDateTime;
	maximumValue?: number | LocalDate | LocalTime | LocalDateTime;
	format?: string;
}
