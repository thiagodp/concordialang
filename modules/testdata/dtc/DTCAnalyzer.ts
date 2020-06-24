import { ExpectedResult } from "./ExpectedResult";
import { Cfg } from "./Cfg";

export abstract class DTCAnalyzer {

	/**
	 * Analyses a configuration to generate a value.
	 *
	 * IMPORTANT: invertedLogic must **not** be considered.
	 *
	 * @param cfg Configuration
	 */
	abstract pre( cfg: Cfg ): ExpectedResult;

	// /**
	//  * Indicates if a generated value is according to the DataTestCase.
	//  *
	//  * IMPORTANT: invertedLogic must not be considered.
	//  */
	// isGeneratedValueCompatible( value: any, cfg: Cfg ): boolean {
	// 	return true;
	// }

	/**
	 * Return `true` if it needs the analysis of the generated value.
	 */
	needsPostAnalysis(): boolean {
		return false;
	}

	/**
	 * Analyses a generated value.
	 *
	 * @param cfg Configuration
	 * @param value Value to analyze.
	 *
	 * @throws Error When the post analysis is not needed.
	 */
	post( cfg: Cfg, value: any ): ExpectedResult {
		throw new Error( 'Post analysis of this data test case is not needed.' );
	}

}
