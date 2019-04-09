import { Step } from "concordialang-types/ast";
import { DataTestCase } from "../testdata/DataTestCase";
import { DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";

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

    isResultInvalid(): boolean {
        return DTCAnalysisResult.INVALID === this.result;
    }

    /** Remember: still have to analyse whether the steps have Then without states */
    shouldFail(): boolean {
        return this.isResultInvalid() && ! this.hasOtherwiseSteps();
    }
}