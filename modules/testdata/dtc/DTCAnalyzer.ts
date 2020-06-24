import { ExpectedResult } from "./ExpectedResult";
import { Cfg } from "./Cfg";

export interface DTCAnalyzer {

	/**
	 * Analyses a configuration to generate a value.
	 *
	 * IMPORTANT: invertedLogic must **not** be considered.
	 *
	 * @param cfg Configuration
	 */
	pre( cfg: Cfg ): ExpectedResult;

}
