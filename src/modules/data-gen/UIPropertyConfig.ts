import { ValueType } from "../util/ValueTypeDetector";
import { DataConstraint } from "./DataConstraint";

// TO-DO: refactor file to another place

export class UIPropertyConfig {

    valueType: ValueType = ValueType.STRING;
    dataConstraints: DataConstraint[] = [];
}