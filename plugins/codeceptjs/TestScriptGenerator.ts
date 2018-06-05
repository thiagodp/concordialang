import { render } from "mustache";
import { AbstractTestScript, ATSCommand } from '../../modules/testscript/AbstractTestScript';
import { CommandMapper } from "./CommandMapper";

const dedent = require('dedent-js');

/**
 * Generate test scripts for CodeceptJS.
 *
 * Uses [Mustache](https://github.com/janl/mustache.js/) for this purpose.
 */
export class TestScriptGenerator {

    private template: string;

    constructor(
        private mapper: CommandMapper
    ) {
        this.template =
        dedent
        `// Generated with ❤ by Concordia
        // source: {{{sourceFile}}}
        //
        // THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

        Feature("{{feature.name}}");
        {{#beforeFeature}}

        BeforeSuite((I) => { // Before Feature
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/beforeFeature}}
        {{#afterFeature}}

        AfterSuite((I) => { // After Feature
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/afterFeature}}
        {{#beforeEachScenario}}

        Before((I) => { // Before Each Scenario
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/beforeEachScenario}}
        {{#afterEachScenario}}

        After((I) => { // After Each Scenario
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/afterEachScenario}}

        {{#testcases}}
        Scenario("{{scenario}} | {{name}}", (I) => {
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });

        {{/testcases}}`;
    }

    public generate( ats: AbstractTestScript ): string {

        // console.log( 'FROM', ats.sourceFile );

        let obj: any = { ... ats }; // spread to do a deep clone

        for ( let test of obj.testcases || [] ) {
            test.convertedCommands = [];
            for ( let cmd of test.commands || [] ) {
                test.convertedCommands.push( this.mapper.map( cmd ) );
            }
        }

        const events = [ 'beforeFeature', 'afterFeature', 'beforeEachScenario', 'afterEachScenario' ];
        for ( let eventStr of events ) {
            let event = obj[ eventStr ];
            if ( ! event ) {
                continue;
            }
            event.convertedCommands = [];
            for ( let cmd of obj.beforeFeature.commands || [] ) {
                event.convertedCommands.push( this.mapper.map( cmd ) );
            }
        }

        return render( this.template, obj ); // mustache's renderer
    }

}