import { isDefined } from "../../../util/TypeChecking";
import { Cfg } from "../Cfg";
import { DTCAnalyzer } from "../DTCAnalyzer";
import { ExpectedResult } from "../ExpectedResult";

class _ extends DTCAnalyzer {

	/** @inheritdoc */
	pre( cfg: Cfg ): ExpectedResult {
		return ExpectedResult.INCOMPATIBLE;
	}

}
