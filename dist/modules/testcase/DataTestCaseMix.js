"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataTestCaseAnalyzer_1 = require("../testdata/DataTestCaseAnalyzer");
const UIETestPlan_1 = require("./UIETestPlan");
/**
 * All UI Elements will contain VALID DataTestCases only.
 *
 * Useful mainly for producing combinations for Preconditions or State Calls, in which
 * the called Test Cases must produce the required State.
 *
 * Example:
 * ```
 * [
 *  {
 *      "a": [ VALUE_MIN => valid, VALUE_MAX => valid ]
 *      "b": [ LENGTH_MIN => valid, LENGTH_MAX => valid ]
 *      "c": [ FORMAT_VALID => valid ]
 *  },
 * ```
 *
 * @author Thiago Delgado Pinto
 */
class OnlyValidMix {
    /** @inheritDoc */
    select(map, alwaysValidVariables) {
        let obj = {};
        for (let [uieName, dtcMap] of map) {
            obj[uieName] = [];
            for (let [dtc, data] of dtcMap) {
                if (DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID === data.result) {
                    obj[uieName].push(new UIETestPlan_1.UIETestPlan(dtc, data.result, data.oracles));
                }
            }
        }
        return [obj];
    }
}
exports.OnlyValidMix = OnlyValidMix;
/**
 * One UI Element will contain only INVALID DataTestCases and
 * the other ones will contain only VALID DataTestCases.
 *
 * Useful for testing a single UI Element at a time.
 *
 * Example:
 * ```
 * [
 *  {
 *      "a": [ VALUE_BELOW_MIN => invalid, VALUE_ABOVE_MAX => invalid ] << first with invalids
 *      "b": [ LENGTH_MIN => valid, LENGTH_MAX => valid ]
 *      "c": [ FORMAT_VALID => valid ]
 *  },
 *  {
 *      "a": [ VALUE_MIN => valid, VALUE_MAX => valid ]
 *      "b": [ LENGTH_BELOW_MIN => invalid, LENGTH_ABOVE_MAX => invalid ] << second with invalids
 *      "c": [ FORMAT_VALID => valid ]
 *  },
  *  {
 *      "a": [ VALUE_MIN => valid, VALUE_MAX => valid ]
 *      "b": [ LENGTH_MIN => invalid, LENGTH_MAX => valid ]
 *      "c": [ FORMAT_INVALID => valid ] << third with invalids
 *  },*
 * ]
 * ```
 *
 *
 * @author Thiago Delgado Pinto
 */
class JustOneInvalidMix {
    /** @inheritDoc */
    select(map, alwaysValidVariables) {
        let all = [];
        for (let [uieName,] of map) {
            let obj = this.oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(map, uieName, alwaysValidVariables);
            all.push(obj);
        }
        return all;
    }
    oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(map, targetUIEName, alwaysValidVariables) {
        let obj = {};
        for (let [uieName, dtcMap] of map) {
            obj[uieName] = [];
            let isTheTargetUIE = uieName === targetUIEName;
            let currentMustBeValid = alwaysValidVariables.indexOf(uieName) >= 0;
            for (let [dtc, data] of dtcMap) {
                if (DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID === data.result) {
                    if (!isTheTargetUIE || currentMustBeValid) {
                        obj[uieName].push(new UIETestPlan_1.UIETestPlan(dtc, data.result, data.oracles));
                    }
                }
                else if (DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID === data.result) {
                    if (isTheTargetUIE && !currentMustBeValid) {
                        obj[uieName].push(new UIETestPlan_1.UIETestPlan(dtc, data.result, data.oracles));
                    }
                }
            }
        }
        return obj;
    }
}
exports.JustOneInvalidMix = JustOneInvalidMix;
// TODO: InvalidPairMix - only two UI Elements will receive INVALID DataTestCases at a time
// TODO: InvalidTripletMix - only three UI Elements will receive INVALID DataTestCases at a time
// TODO: UntouchedMix - all the DataTestCases will be combined.
/**
 * All UI Elements will contain INVALID DataTestCases only.
 *
 * Useful testing all the exceptional conditions simultaneously.
 *
 * Example:
 * ```
 * [
 *  {
 *      "a": [ VALUE_BELOW_MIN => invalid, VALUE_ABOVE_MAX => invalid ]
 *      "b": [ LENGTH_BELOW_MIN => invalid, LENGTH_ABOVE_MAX => invalid ]
 *      "c": [ FORMAT_INVALID => valid ]
 *  }
 * ]
 *
 * @author Thiago Delgado Pinto
 */
class OnlyInvalidMix {
    /** @inheritDoc */
    select(map, alwaysValidVariables) {
        let obj = {};
        for (let [uieName, dtcMap] of map) {
            obj[uieName] = [];
            let currentMustBeValid = alwaysValidVariables.indexOf(uieName) >= 0;
            for (let [dtc, data] of dtcMap) {
                if ((DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID === data.result && !currentMustBeValid)
                    || (DataTestCaseAnalyzer_1.DTCAnalysisResult.VALID === data.result && currentMustBeValid)) {
                    obj[uieName].push(new UIETestPlan_1.UIETestPlan(dtc, data.result, data.oracles));
                }
            }
        }
        return [obj];
    }
}
exports.OnlyInvalidMix = OnlyInvalidMix;
/**
 * Does not filter the available elements, except for the incompatible ones
 * and the alwaysValidVariables.
 *
 * @author Thiago Delgado Pinto
 */
class UnfilteredMix {
    /** @inheritDoc */
    select(map, alwaysValidVariables) {
        let obj = {};
        for (let [uieName, dtcMap] of map) {
            obj[uieName] = [];
            let currentMustBeValid = alwaysValidVariables.indexOf(uieName) >= 0;
            for (let [dtc, data] of dtcMap) {
                if (DataTestCaseAnalyzer_1.DTCAnalysisResult.INCOMPATIBLE === data.result
                    || (currentMustBeValid && DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID === data.result)) {
                    continue;
                }
                obj[uieName].push(new UIETestPlan_1.UIETestPlan(dtc, data.result, data.oracles));
            }
        }
        return [obj];
    }
}
exports.UnfilteredMix = UnfilteredMix;
