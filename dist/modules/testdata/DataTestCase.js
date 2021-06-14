/**
 * Data test cases.
 *
 * @author Thiago Delgado Pinto
 */
export var DataTestCase;
(function (DataTestCase) {
    // value
    DataTestCase["VALUE_LOWEST"] = "VALUE_LOWEST";
    DataTestCase["VALUE_RANDOM_BELOW_MIN"] = "VALUE_RANDOM_BELOW_MIN";
    DataTestCase["VALUE_JUST_BELOW_MIN"] = "VALUE_JUST_BELOW_MIN";
    DataTestCase["VALUE_MIN"] = "VALUE_MIN";
    DataTestCase["VALUE_JUST_ABOVE_MIN"] = "VALUE_JUST_ABOVE_MIN";
    DataTestCase["VALUE_ZERO"] = "VALUE_ZERO";
    DataTestCase["VALUE_MEDIAN"] = "VALUE_MEDIAN";
    DataTestCase["VALUE_RANDOM_BETWEEN_MIN_MAX"] = "VALUE_RANDOM_BETWEEN_MIN_MAX";
    DataTestCase["VALUE_JUST_BELOW_MAX"] = "VALUE_JUST_BELOW_MAX";
    DataTestCase["VALUE_MAX"] = "VALUE_MAX";
    DataTestCase["VALUE_JUST_ABOVE_MAX"] = "VALUE_JUST_ABOVE_MAX";
    DataTestCase["VALUE_RANDOM_ABOVE_MAX"] = "VALUE_RANDOM_ABOVE_MAX";
    DataTestCase["VALUE_GREATEST"] = "VALUE_GREATEST";
    // length
    DataTestCase["LENGTH_LOWEST"] = "LENGTH_LOWEST";
    DataTestCase["LENGTH_RANDOM_BELOW_MIN"] = "LENGTH_RANDOM_BELOW_MIN";
    DataTestCase["LENGTH_JUST_BELOW_MIN"] = "LENGTH_JUST_BELOW_MIN";
    DataTestCase["LENGTH_MIN"] = "LENGTH_MIN";
    DataTestCase["LENGTH_JUST_ABOVE_MIN"] = "LENGTH_JUST_ABOVE_MIN";
    DataTestCase["LENGTH_MEDIAN"] = "LENGTH_MEDIAN";
    DataTestCase["LENGTH_RANDOM_BETWEEN_MIN_MAX"] = "LENGTH_RANDOM_BETWEEN_MIN_MAX";
    DataTestCase["LENGTH_JUST_BELOW_MAX"] = "LENGTH_JUST_BELOW_MAX";
    DataTestCase["LENGTH_MAX"] = "LENGTH_MAX";
    DataTestCase["LENGTH_JUST_ABOVE_MAX"] = "LENGTH_JUST_ABOVE_MAX";
    DataTestCase["LENGTH_RANDOM_ABOVE_MAX"] = "LENGTH_RANDOM_ABOVE_MAX";
    DataTestCase["LENGTH_GREATEST"] = "LENGTH_GREATEST";
    // format
    DataTestCase["FORMAT_VALID"] = "FORMAT_VALID";
    DataTestCase["FORMAT_INVALID"] = "FORMAT_INVALID";
    // set
    DataTestCase["SET_FIRST_ELEMENT"] = "SET_FIRST_ELEMENT";
    DataTestCase["SET_RANDOM_ELEMENT"] = "SET_RANDOM_ELEMENT";
    DataTestCase["SET_LAST_ELEMENT"] = "SET_LAST_ELEMENT";
    DataTestCase["SET_NOT_IN_SET"] = "SET_NOT_IN_SET";
    // required
    DataTestCase["REQUIRED_FILLED"] = "REQUIRED_FILLED";
    DataTestCase["REQUIRED_NOT_FILLED"] = "REQUIRED_NOT_FILLED";
    // computation
    DataTestCase["COMPUTATION_RIGHT"] = "COMPUTATION_RIGHT";
    DataTestCase["COMPUTATION_WRONG"] = "COMPUTATION_WRONG";
})(DataTestCase || (DataTestCase = {}));
/**
 * Data test case group.
 *
 * @author Thiago Delgado Pinto
 */
export var DataTestCaseGroup;
(function (DataTestCaseGroup) {
    DataTestCaseGroup[DataTestCaseGroup["VALUE"] = 0] = "VALUE";
    DataTestCaseGroup[DataTestCaseGroup["LENGTH"] = 1] = "LENGTH";
    DataTestCaseGroup[DataTestCaseGroup["FORMAT"] = 2] = "FORMAT";
    DataTestCaseGroup[DataTestCaseGroup["SET"] = 3] = "SET";
    DataTestCaseGroup[DataTestCaseGroup["REQUIRED"] = 4] = "REQUIRED";
    DataTestCaseGroup[DataTestCaseGroup["COMPUTATION"] = 5] = "COMPUTATION";
})(DataTestCaseGroup || (DataTestCaseGroup = {}));
/**
 * Data test cases of each group.
 *
 * @author Thiago Delgado Pinto
 */
export class DataTestCaseGroupDef {
    constructor() {
        this.value = [
            DataTestCase.VALUE_LOWEST,
            DataTestCase.VALUE_RANDOM_BELOW_MIN,
            DataTestCase.VALUE_JUST_BELOW_MIN,
            DataTestCase.VALUE_MIN,
            DataTestCase.VALUE_JUST_ABOVE_MIN,
            DataTestCase.VALUE_ZERO,
            DataTestCase.VALUE_MEDIAN,
            DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX,
            DataTestCase.VALUE_JUST_BELOW_MAX,
            DataTestCase.VALUE_MAX,
            DataTestCase.VALUE_JUST_ABOVE_MAX,
            DataTestCase.VALUE_RANDOM_ABOVE_MAX,
            DataTestCase.VALUE_GREATEST
        ];
        this.length = [
            DataTestCase.LENGTH_LOWEST,
            DataTestCase.LENGTH_RANDOM_BELOW_MIN,
            DataTestCase.LENGTH_JUST_BELOW_MIN,
            DataTestCase.LENGTH_MIN,
            DataTestCase.LENGTH_JUST_ABOVE_MIN,
            DataTestCase.LENGTH_MEDIAN,
            DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX,
            DataTestCase.LENGTH_JUST_BELOW_MAX,
            DataTestCase.LENGTH_MAX,
            DataTestCase.LENGTH_JUST_ABOVE_MAX,
            DataTestCase.LENGTH_RANDOM_ABOVE_MAX,
            DataTestCase.LENGTH_GREATEST
        ];
        this.format = [
            DataTestCase.FORMAT_VALID,
            DataTestCase.FORMAT_INVALID
        ];
        this.set = [
            DataTestCase.SET_FIRST_ELEMENT,
            DataTestCase.SET_RANDOM_ELEMENT,
            DataTestCase.SET_LAST_ELEMENT,
            DataTestCase.SET_NOT_IN_SET
        ];
        this.required = [
            DataTestCase.REQUIRED_FILLED,
            DataTestCase.REQUIRED_NOT_FILLED
        ];
        this.computation = [
            DataTestCase.COMPUTATION_RIGHT,
            DataTestCase.COMPUTATION_WRONG
        ];
    }
    /**
     * Returns the test cases of the given group.
     *
     * @param group Test case group.
     */
    ofGroup(group) {
        switch (group) {
            case DataTestCaseGroup.VALUE: return this.value;
            case DataTestCaseGroup.LENGTH: return this.length;
            case DataTestCaseGroup.FORMAT: return this.format;
            case DataTestCaseGroup.SET: return this.set;
            case DataTestCaseGroup.REQUIRED: return this.required;
            case DataTestCaseGroup.COMPUTATION: return this.computation;
            default: throw new Error('Unexpected group');
        }
    }
    /**
     * Returns the group of the given test case.
     *
     * @param testCase Test case
     */
    groupOf(testCase) {
        if (this.value.indexOf(testCase) >= 0)
            return DataTestCaseGroup.VALUE;
        if (this.length.indexOf(testCase) >= 0)
            return DataTestCaseGroup.LENGTH;
        if (this.format.indexOf(testCase) >= 0)
            return DataTestCaseGroup.FORMAT;
        if (this.set.indexOf(testCase) >= 0)
            return DataTestCaseGroup.SET;
        if (this.required.indexOf(testCase) >= 0)
            return DataTestCaseGroup.REQUIRED;
        if (this.computation.indexOf(testCase) >= 0)
            return DataTestCaseGroup.COMPUTATION;
        // default
        return DataTestCaseGroup.REQUIRED;
    }
}
