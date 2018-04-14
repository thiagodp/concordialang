import { DataTestCase } from "../testdata/DataTestCase";
import { DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";
import { Step } from "../ast/Step";

export class UIETestPlan {

    constructor(
        public readonly dtc: DataTestCase,
        public readonly result: DTCAnalysisResult,
        public readonly otherwiseSteps: Step[]
    ) {
    }

    hasOtherwiseSteps(): boolean {
        return ( this.otherwiseSteps || [] ).length > 0;
    }

    /** Remember: still have to analyse whether the steps have Then without states */
    shouldFail(): boolean {
        return DTCAnalysisResult.INVALID === this.result && ! this.hasOtherwiseSteps();
    }
}