import { TestScenario } from "./TestScenario";
import { TestScenariosToCombine } from "./TestScenariosToCombine";
import * as deepcopy from 'deepcopy';

/**
 * Test Scenario combinator
 *
 * @author Thiago Delgado Pinto
 */
export class TestScenarioCombinator {

    combine(
        baseTestScenario: TestScenario,
        allTestScenariosToCombine: TestScenariosToCombine[]
    ): TestScenario[] {
        let all: TestScenario[] = [];
        for ( let tsc of allTestScenariosToCombine ) {
            let ts = this.cloneTestScenario( baseTestScenario );
            for ( let pair of tsc ) {
                const [ state, stateTS ] = pair.toArray();
                this.replaceStepWithTestScenario( ts, state.stepIndex, stateTS );
            }
        }
        return all;
    }

    cloneTestScenario( ts: TestScenario ): TestScenario {
        return deepcopy( ts) as TestScenario;
    }

    replaceStepWithTestScenario( from: TestScenario, stepIndex: number, stepReplacer: TestScenario ) {
        from.steps.splice( stepIndex, 1, ...stepReplacer.steps );
    }

}
