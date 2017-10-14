import { ActionMapper } from "./ActionMapper";
import { render } from "mustache";
import { ATSCommand } from "../../modules/ts/AbstractTestScript";
const dedent = require('dedent-js');

/**
 * Uses [Mustache](https://github.com/janl/mustache.js/) to parse abstract test cases
 * to CodeceptJS code.
 * 
 * @author Matheus Eller Fagundes
 */
export class TestScriptGenerator {

    private template: string;
    private mapper: ActionMapper;

    constructor() {
        this.template =
        dedent
        `/** Generated with <3 by Concordia. Run the following tests using CodeceptJS. */

        Feature('{{feature.name}}');
        
        {{#scenarios}}
        Scenario('{{name}}', (I) => {
            {{#commands}}
            {{{.}}}
            {{/commands}}
        });
        
        {{/scenarios}}`;
        this.mapper = new ActionMapper();
    }
    
    public generateScript( testCase: any ): string {
        testCase.testcases.forEach( ( test: any ) => {
            let commands: Array<any> = [];
            test.commands.forEach( ( cmd: any ) => {
                let command: ATSCommand = cmd;
                commands.push( this.mapper.map( command ) );
            });
            testCase.scenarios.forEach( ( scenario: any ) => {
                if ( scenario.name === test.scenario ) {
                    scenario.commands = commands;
                }
            });
        } );
        return render(this.template, testCase);
    }

}