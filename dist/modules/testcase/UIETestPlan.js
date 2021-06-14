import { DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";
export class UIETestPlan {
    constructor(dtc, result, otherwiseSteps) {
        this.dtc = dtc;
        this.result = result;
        this.otherwiseSteps = otherwiseSteps;
    }
    hasOtherwiseSteps() {
        return (this.otherwiseSteps || []).length > 0;
    }
    isResultInvalid() {
        return DTCAnalysisResult.INVALID === this.result;
    }
    /** Remember: still have to analyse whether the steps have Then without states */
    shouldFail() {
        return this.isResultInvalid() && !this.hasOtherwiseSteps();
    }
}
