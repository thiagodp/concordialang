"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDataTestCases = void 0;
const enumUtil = require("enum-util");
const cases_1 = require("./cases");
const MedianValue_1 = require("./cases/MedianValue");
const RandomAboveMaximumValue_1 = require("./cases/RandomAboveMaximumValue");
const RandomBelowMinimumValue_1 = require("./cases/RandomBelowMinimumValue");
const RandomBetweenMinimumAndMaximumValue_1 = require("./cases/RandomBetweenMinimumAndMaximumValue");
const DataTestCase_1 = require("./DataTestCase");
const ExpectedResult_1 = require("./ExpectedResult");
/**
 * Evaluates all the data test cases applicable to the given configuration.
 *
 * @param cfg Configuration
 */
function evaluateDataTestCases(cfg) {
    const map = new Map();
    const cases = enumUtil.getValues(DataTestCase_1.DataTestCase);
    for (const dtc of cases) {
        let e = evaluateSingleDataTestCase(dtc, cfg);
        if (true === cfg.invertedLogic) {
            e = invertValidity(e);
        }
        if (true === cfg.withOnlyValidDTC && ExpectedResult_1.ExpectedResult.INVALID === e) {
            e = ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
        }
        map.set(dtc, e);
    }
    return map;
}
exports.evaluateDataTestCases = evaluateDataTestCases;
/**
 * Evaluates a data test cases against the given configuration.
 *
 * @param cfg Configuration
 */
function evaluateSingleDataTestCase(dtc, cfg) {
    switch (dtc) {
        case DataTestCase_1.DataTestCase.RANDOM_VALUE:
            return (new cases_1.RandomValue()).pre(cfg);
        // Value
        case DataTestCase_1.DataTestCase.EQUAL_TO_VALUE:
            return (new cases_1.EqualToValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_DIFFERENT_FROM_VALUE:
            return (new cases_1.RandomDifferentFromValue()).pre(cfg);
        // Set
        case DataTestCase_1.DataTestCase.RANDOM_IN_SET:
            return (new cases_1.RandomInSet()).pre(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_NOT_IN_SET:
            return (new cases_1.RandomNotInSet()).pre(cfg);
        // Number
        case DataTestCase_1.DataTestCase.ZERO:
            return (new cases_1.Zero()).pre(cfg);
        // String
        case DataTestCase_1.DataTestCase.EMPTY:
            return (new cases_1.Empty()).pre(cfg);
        case DataTestCase_1.DataTestCase.GREATEST_LENGTH:
            return (new cases_1.GreatestLength()).pre(cfg);
        // Minimum length
        case DataTestCase_1.DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH:
            return (new cases_1.RandomBelowMinimumLength()).pre(cfg);
        case DataTestCase_1.DataTestCase.JUST_BELOW_MINIMUM_LENGTH:
            return (new cases_1.JustBelowMinimumLength()).pre(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MINIMUM_LENGTH:
            return (new cases_1.EqualToMinimumLength()).pre(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MINIMUM_LENGTH:
            return (new cases_1.JustAboveMinimumLength()).pre(cfg);
        // Maximum length
        case DataTestCase_1.DataTestCase.JUST_BELOW_MAXIMUM_LENGTH:
            return (new cases_1.JustBelowMaximumLength()).pre(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MAXIMUM_LENGTH:
            return (new cases_1.EqualToMaximumLength()).pre(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH:
            return (new cases_1.JustAboveMaximumLength()).pre(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH:
            return (new cases_1.RandomAboveMaximumLength()).pre(cfg);
        // Minimum length & Maximum length
        case DataTestCase_1.DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH:
            return (new cases_1.RandomBetweenMinimumAndMaximumLength()).pre(cfg);
        // Minimum value
        case DataTestCase_1.DataTestCase.LOWEST_VALUE:
            return (new cases_1.LowestValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_BELOW_MINIMUM_VALUE:
            return (new RandomBelowMinimumValue_1.RandomBelowMinimumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.JUST_BELOW_MINIMUM_VALUE:
            return (new cases_1.JustBelowMinimumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MINIMUM_VALUE:
            return (new cases_1.EqualToMinimumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MINIMUM_VALUE:
            return (new cases_1.JustAboveMinimumValue()).pre(cfg);
        // Maximum value
        case DataTestCase_1.DataTestCase.JUST_BELOW_MAXIMUM_VALUE:
            return (new cases_1.JustBelowMaximumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MAXIMUM_VALUE:
            return (new cases_1.EqualToMaximumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MAXIMUM_VALUE:
            return (new cases_1.JustAboveMaximumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE:
            return (new RandomAboveMaximumValue_1.RandomAboveMaximumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.GREATEST_VALUE:
            return (new cases_1.GreatestValue()).pre(cfg);
        // Minimum value & Maximum value
        case DataTestCase_1.DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE:
            return (new RandomBetweenMinimumAndMaximumValue_1.RandomBetweenMinimumAndMaximumValue()).pre(cfg);
        case DataTestCase_1.DataTestCase.MEDIAN_VALUE:
            return (new MedianValue_1.MedianValue()).pre(cfg);
        // Format
        case DataTestCase_1.DataTestCase.RANDOM_FROM_FORMAT:
            return (new cases_1.RandomFromFormat()).pre(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT:
            return (new cases_1.RandomDifferentFromFormat()).pre(cfg);
    }
    return ExpectedResult_1.ExpectedResult.INCOMPATIBLE;
}
function invertValidity(result) {
    switch (result) {
        case ExpectedResult_1.ExpectedResult.VALID: return ExpectedResult_1.ExpectedResult.INVALID;
        case ExpectedResult_1.ExpectedResult.INVALID: return ExpectedResult_1.ExpectedResult.VALID;
        default: return result;
    }
}
