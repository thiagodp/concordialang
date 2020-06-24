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
            return (new cases_1.RandomValue()).analyze(cfg);
        // Value
        case DataTestCase_1.DataTestCase.EQUAL_TO_VALUE:
            return (new cases_1.EqualToValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_DIFFERENT_FROM_VALUE:
            return (new cases_1.RandomDifferentFromValue()).analyze(cfg);
        // Set
        case DataTestCase_1.DataTestCase.RANDOM_IN_SET:
            return (new cases_1.RandomInSet()).analyze(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_NOT_IN_SET:
            return (new cases_1.RandomNotInSet()).analyze(cfg);
        // Number
        case DataTestCase_1.DataTestCase.ZERO:
            return (new cases_1.Zero()).analyze(cfg);
        // String
        case DataTestCase_1.DataTestCase.EMPTY:
            return (new cases_1.Empty()).analyze(cfg);
        case DataTestCase_1.DataTestCase.GREATEST_LENGTH:
            return (new cases_1.GreatestLength()).analyze(cfg);
        // Minimum length
        case DataTestCase_1.DataTestCase.RANDOM_BELOW_MINIMUM_LENGTH:
            return (new cases_1.RandomBelowMinimumLength()).analyze(cfg);
        case DataTestCase_1.DataTestCase.JUST_BELOW_MINIMUM_LENGTH:
            return (new cases_1.JustBelowMinimumLength()).analyze(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MINIMUM_LENGTH:
            return (new cases_1.EqualToMinimumLength()).analyze(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MINIMUM_LENGTH:
            return (new cases_1.JustAboveMinimumLength()).analyze(cfg);
        // Maximum length
        case DataTestCase_1.DataTestCase.JUST_BELOW_MAXIMUM_LENGTH:
            return (new cases_1.JustBelowMaximumLength()).analyze(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MAXIMUM_LENGTH:
            return (new cases_1.EqualToMaximumLength()).analyze(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MAXIMUM_LENGTH:
            return (new cases_1.JustAboveMaximumLength()).analyze(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_ABOVE_MAXIMUM_LENGTH:
            return (new cases_1.RandomAboveMaximumLength()).analyze(cfg);
        // Minimum length & Maximum length
        case DataTestCase_1.DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH:
            return (new cases_1.RandomBetweenMinimumAndMaximumLength()).analyze(cfg);
        // Minimum value
        case DataTestCase_1.DataTestCase.LOWEST_VALUE:
            return (new cases_1.LowestValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_BELOW_MINIMUM_VALUE:
            return (new RandomBelowMinimumValue_1.RandomBelowMinimumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.JUST_BELOW_MINIMUM_VALUE:
            return (new cases_1.JustBelowMinimumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MINIMUM_VALUE:
            return (new cases_1.EqualToMinimumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MINIMUM_VALUE:
            return (new cases_1.JustAboveMinimumValue()).analyze(cfg);
        // Maximum value
        case DataTestCase_1.DataTestCase.JUST_BELOW_MAXIMUM_VALUE:
            return (new cases_1.JustBelowMaximumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.EQUAL_TO_MAXIMUM_VALUE:
            return (new cases_1.EqualToMaximumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.JUST_ABOVE_MAXIMUM_VALUE:
            return (new cases_1.JustAboveMaximumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_ABOVE_MAXIMUM_VALUE:
            return (new RandomAboveMaximumValue_1.RandomAboveMaximumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.GREATEST_VALUE:
            return (new cases_1.GreatestValue()).analyze(cfg);
        // Minimum value & Maximum value
        case DataTestCase_1.DataTestCase.RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE:
            return (new RandomBetweenMinimumAndMaximumValue_1.RandomBetweenMinimumAndMaximumValue()).analyze(cfg);
        case DataTestCase_1.DataTestCase.MEDIAN_VALUE:
            return (new MedianValue_1.MedianValue()).analyze(cfg);
        // Format
        case DataTestCase_1.DataTestCase.RANDOM_FROM_FORMAT:
            return (new cases_1.RandomFromFormat()).analyze(cfg);
        case DataTestCase_1.DataTestCase.RANDOM_DIFFERENT_FROM_FORMAT:
            return (new cases_1.RandomDifferentFromFormat()).analyze(cfg);
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
