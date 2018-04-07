import { Variant, TestCase } from "../ast/Variant";
import { TestScenario } from "../testscenario/TSGen";

export class TCGen {

    constructor(
        // private _variantToTestCaseMap: Map< Variant, TestCase[] >
    ) {
    }

    generate(
        variant: Variant,
        testScenarios: TestScenario[]
    ): TestCase[] {
        let testCases: TestCase[] = [];

        //
        // Test Cases are formed according to the UI Elements and applicable Data Test Cases.
        //
        // Steps with the "external" flag set - referred here as "external step" - indicate
        // that a valid value should be generated for it. So if an external step has a UI Element
        // reference, there is a need to generate a valid value. Thus, such steps from any
        // Test Scenario must be changed.
        //
        // Non external steps that have references to UI Elements must receive test data
        // according to the applicable Data Test Case. Since there may be an explosion of
        // combinations, a combination strategy is needed (ex.: defaults to 1-wise).
        //

        // Question: gerar valores para UI Elements de Variants externas ao gerar o cenário de teste?

        return testCases;
    }

}