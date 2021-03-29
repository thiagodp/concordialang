import { DataGenConfig } from '../DataGenerator';
import { DataTestCase } from './DataTestCase';
import { ExpectedResult } from './ExpectedResult';

/**
 * Analyzes the target DataTestCase according to a source DataTestCase and is expected result.
 * The target UI Element depends on the source UI Element.
 *
 * @param sourceDTC Source DataTestCase.
 * @param sourceDTCResult Expected result for the source DataTestCase.
 * @param targetCfg Target UI Element configuration.
 * @param targetDTC Target DataTestCase - the one to be evaluated.
 * @param targetDTCResult Expected result for the source DataTestCase - the one to be changed or not.
 * @returns The adjusted (or not) result for the target DataTestCase.
 */
export function evaluateTargetDataTestCase(

    sourceDTC: DataTestCase,
	sourceDTCResult: ExpectedResult,

    targetCfg: DataGenConfig,
	targetDTC: DataTestCase,
    targetDTCResult: ExpectedResult,

): ExpectedResult {
    // Target depends on the source UIE

    // Source is invalid
    if ( ExpectedResult.INVALID === sourceDTCResult ) {

        // Target is cannot be empty -> its DTC is considered as Invalid
        if ( targetCfg.required ) {
            return ExpectedResult.INVALID;
        }

        // Target is can be empty -> any DTC different from Empty is Invalid
        if ( targetDTC !== DataTestCase.EMPTY ) {
            return ExpectedResult.INVALID;
        }

    } else if ( ExpectedResult.VALID === sourceDTCResult ) {

        // Source's DTC is empty and Target's DTC is not empty
        if ( DataTestCase.EMPTY === sourceDTC && targetDTC != DataTestCase.EMPTY ) {
            return ExpectedResult.INVALID;
        }

    }

    // Keep the current result
    return targetDTCResult;
}