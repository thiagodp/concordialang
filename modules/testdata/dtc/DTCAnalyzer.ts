import { ExpectedResult } from "./ExpectedResult";
import { PropCfg } from "./prop-cfg";

export interface DTCAnalyzer {

	/**
	 * Analyses a configuration to generate a value.
	 *
	 * IMPORTANT: invertedLogic must **not** be considered.
	 *
	 * @param cfg Configuration
	 */
	analyze( cfg: PropCfg ): ExpectedResult;

}
